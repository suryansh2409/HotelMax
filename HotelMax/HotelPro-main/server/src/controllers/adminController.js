const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Payment = require('../models/Payment');
const HotelSetting = require('../models/HotelSetting');
const AuditLog = require('../models/AuditLog');
const ServiceRequest = require('../models/ServiceRequest');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { recordAuditLog } = require('../middleware/auditMiddleware');

/**
 * Get administrator overview metrics (calculated strictly from DB)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBookings,
      totalCustomers,
      totalRooms,
      occupiedRooms,
      paidPayments,
      pendingBookings,
      pendingRequests,
      recentLogs
    ] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Room.countDocuments({ isActive: true }),
      Room.countDocuments({ physicalStatus: 'occupied' }),
      Payment.find({ status: 'captured' }).select('amount'),
      Booking.countDocuments({ status: 'pending_payment' }),
      ServiceRequest.countDocuments({ status: 'pending' }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return successResponse(res, 200, 'Admin dashboard statistics retrieved', {
      totalBookings,
      totalCustomers,
      totalRooms,
      occupiedRooms,
      occupancyRate,
      totalRevenue,
      pendingBookings,
      pendingRequests,
      recentActivity: recentLogs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get analytics datasets for Recharts
 */
const getAnalyticsData = async (req, res, next) => {
  try {
    // 1. Monthly revenue and booking count aggregation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$priceBreakdown.totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = monthlyTrends.map((t) => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      revenue: t.revenue,
      bookings: t.bookings
    }));

    // 2. Room category distribution
    const categoryDistribution = await Room.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$basePrice' }
        }
      }
    ]);

    const formattedCategories = categoryDistribution.map((c) => ({
      name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
      count: c.count,
      avgPrice: Math.round(c.avgPrice)
    }));

    // 3. Booking status breakdown
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStatuses = statusCounts.map((s) => ({
      status: s._id,
      count: s.count
    }));

    return successResponse(res, 200, 'Analytics retrieved', {
      monthlyTrends: formattedTrends,
      roomCategories: formattedCategories,
      statusBreakdown: formattedStatuses
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all bookings with filtering & pagination
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'guestDetails.fullName': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('room', 'roomNumber title type basePrice')
        .populate('user', 'name email phone')
        .populate('payment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Booking.countDocuments(filter)
    ]);

    return successResponse(res, 200, 'All bookings retrieved', bookings, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update booking status directly (Admin override)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    recordAuditLog({
      user: req.user,
      action: 'ADMIN_BOOKING_STATUS_OVERRIDE',
      entity: 'Booking',
      entityId: booking._id,
      details: { newStatus: status, bookingReference: booking.bookingReference },
      req
    });

    return successResponse(res, 200, 'Booking status updated by admin', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * User & Staff Management
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter)
    ]);

    return successResponse(res, 200, 'Users retrieved', users, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Securely create staff or additional admin account
 */
const createStaffAccount = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'staff' } = req.body;

    if (!['staff', 'admin'].includes(role)) {
      return errorResponse(res, 400, 'Invalid administrative role.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'User with this email already exists.');
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role
    });

    recordAuditLog({
      user: req.user,
      action: 'STAFF_ACCOUNT_CREATED',
      entity: 'User',
      entityId: newUser._id,
      details: { email: newUser.email, role: newUser.role },
      req
    });

    return successResponse(res, 201, `${role === 'admin' ? 'Administrator' : 'Staff'} account created successfully`, {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Activate or deactivate user account
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return errorResponse(res, 400, 'You cannot deactivate your own administrative account.');
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return errorResponse(res, 404, 'User not found');
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();

    recordAuditLog({
      user: req.user,
      action: targetUser.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entity: 'User',
      entityId: targetUser._id,
      details: { email: targetUser.email, isActive: targetUser.isActive },
      req
    });

    return successResponse(res, 200, `User account ${targetUser.isActive ? 'activated' : 'deactivated'}`, targetUser);
  } catch (err) {
    next(err);
  }
};

/**
 * System Settings
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await HotelSetting.findOne();
    if (!settings) {
      settings = await HotelSetting.create({});
    }
    return successResponse(res, 200, 'Settings retrieved', settings);
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await HotelSetting.findOne();
    if (!settings) {
      settings = await HotelSetting.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    recordAuditLog({
      user: req.user,
      action: 'SETTINGS_UPDATED',
      entity: 'HotelSetting',
      entityId: settings._id,
      details: req.body,
      req
    });

    return successResponse(res, 200, 'Hotel settings updated', settings);
  } catch (err) {
    next(err);
  }
};

/**
 * System Audit Logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      AuditLog.countDocuments()
    ]);

    return successResponse(res, 200, 'Audit logs retrieved', logs, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAnalyticsData,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  createStaffAccount,
  toggleUserStatus,
  getSettings,
  updateSettings,
  getAuditLogs
};
