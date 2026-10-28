const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Housekeeping = require('../models/Housekeeping');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { recordAuditLog } = require('../middleware/auditMiddleware');

/**
 * Get daily operations overview
 */
const getDailyOperations = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      arrivalsCount,
      departuresCount,
      occupiedRooms,
      totalRooms,
      cleaningRooms,
      maintenanceRooms,
      pendingRequests
    ] = await Promise.all([
      Booking.countDocuments({
        checkInDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'pending_payment'] }
      }),
      Booking.countDocuments({
        checkOutDate: { $gte: today, $lt: tomorrow },
        status: 'checked_in'
      }),
      Room.countDocuments({ physicalStatus: 'occupied' }),
      Room.countDocuments({ isActive: true }),
      Room.countDocuments({ physicalStatus: 'cleaning' }),
      Room.countDocuments({ physicalStatus: 'maintenance' }),
      ServiceRequest.countDocuments({ status: { $in: ['pending', 'in_progress'] } })
    ]);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return successResponse(res, 200, 'Daily operational summary retrieved', {
      arrivalsCount,
      departuresCount,
      occupiedRooms,
      totalRooms,
      cleaningRooms,
      maintenanceRooms,
      occupancyRate,
      pendingRequests
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get arrivals list (today or all pending check-in)
 */
const getArrivals = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {
      status: { $in: ['confirmed', 'pending_payment'] }
    };

    if (search) {
      filter.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'guestDetails.fullName': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } },
        { 'guestDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const arrivals = await Booking.find(filter)
      .populate('room')
      .populate('user', 'name email phone avatar')
      .sort({ checkInDate: 1 });

    return successResponse(res, 200, 'Arrivals retrieved', arrivals);
  } catch (err) {
    next(err);
  }
};

/**
 * Get departures list (checked-in guests)
 */
const getDepartures = async (req, res, next) => {
  try {
    const departures = await Booking.find({ status: 'checked_in' })
      .populate('room')
      .populate('user', 'name email phone avatar')
      .sort({ checkOutDate: 1 });

    return successResponse(res, 200, 'Departures retrieved', departures);
  } catch (err) {
    next(err);
  }
};

/**
 * Check-in guest
 */
const checkInGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('room');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status === 'checked_in') {
      return errorResponse(res, 400, 'Guest is already checked in.');
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'Cannot check in a cancelled booking.');
    }

    booking.status = 'checked_in';
    booking.checkedInAt = new Date();
    await booking.save();

    // Update physical room status to occupied
    await Room.findByIdAndUpdate(booking.room._id, { physicalStatus: 'occupied' });

    recordAuditLog({
      user: req.user,
      action: 'GUEST_CHECKED_IN',
      entity: 'Booking',
      entityId: booking._id,
      details: { bookingReference: booking.bookingReference, roomNumber: booking.room.roomNumber },
      req
    });

    return successResponse(res, 200, 'Guest checked in successfully', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Check-out guest
 */
const checkOutGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('room');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'checked_in') {
      return errorResponse(res, 400, 'Only checked-in guests can be checked out.');
    }

    booking.status = 'completed';
    booking.checkedOutAt = new Date();
    await booking.save();

    // Mark physical room status as cleaning
    await Room.findByIdAndUpdate(booking.room._id, { physicalStatus: 'cleaning' });

    // Automatically create a housekeeping task
    await Housekeeping.create({
      room: booking.room._id,
      taskType: 'cleaning',
      priority: 'high',
      status: 'pending',
      notes: `Standard departure clean after checkout of ${booking.bookingReference}`
    });

    recordAuditLog({
      user: req.user,
      action: 'GUEST_CHECKED_OUT',
      entity: 'Booking',
      entityId: booking._id,
      details: { bookingReference: booking.bookingReference, roomNumber: booking.room.roomNumber },
      req
    });

    return successResponse(res, 200, 'Guest checked out successfully and room dispatched to housekeeping', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Update physical room status
 */
const updateRoomPhysicalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { physicalStatus } = req.body;

    const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];
    if (!validStatuses.includes(physicalStatus)) {
      return errorResponse(res, 400, `Invalid status. Valid values: ${validStatuses.join(', ')}`);
    }

    const room = await Room.findByIdAndUpdate(id, { physicalStatus }, { new: true });
    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }

    recordAuditLog({
      user: req.user,
      action: 'ROOM_PHYSICAL_STATUS_UPDATED',
      entity: 'Room',
      entityId: room._id,
      details: { roomNumber: room.roomNumber, physicalStatus },
      req
    });

    return successResponse(res, 200, 'Room physical status updated', room);
  } catch (err) {
    next(err);
  }
};

/**
 * Housekeeping tasks
 */
const getHousekeepingTasks = async (req, res, next) => {
  try {
    const tasks = await Housekeeping.find()
      .populate('room', 'roomNumber title type physicalStatus')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Housekeeping tasks retrieved', tasks);
  } catch (err) {
    next(err);
  }
};

const createHousekeepingTask = async (req, res, next) => {
  try {
    const { room, assignedTo, taskType, priority, notes } = req.body;

    const task = await Housekeeping.create({
      room,
      assignedTo,
      taskType,
      priority,
      notes,
      status: 'pending'
    });

    return successResponse(res, 201, 'Housekeeping task assigned', task);
  } catch (err) {
    next(err);
  }
};

const updateHousekeepingTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (notes) updates.notes = notes;
    if (assignedTo) updates.assignedTo = assignedTo;
    if (status === 'completed') updates.completedAt = new Date();

    const task = await Housekeeping.findByIdAndUpdate(id, updates, { new: true })
      .populate('room')
      .populate('assignedTo', 'name');

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    // If cleaning task completed, mark room physicalStatus back to available if not occupied
    if (status === 'completed' && task.room && task.room.physicalStatus === 'cleaning') {
      await Room.findByIdAndUpdate(task.room._id, { physicalStatus: 'available' });
    }

    return successResponse(res, 200, 'Task updated', task);
  } catch (err) {
    next(err);
  }
};

/**
 * Service requests
 */
const getServiceRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('room', 'roomNumber title')
      .populate('guest', 'name email phone')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Service requests retrieved', requests);
  } catch (err) {
    next(err);
  }
};

const createServiceRequest = async (req, res, next) => {
  try {
    const { bookingId, roomId, requestType, description } = req.body;

    const request = await ServiceRequest.create({
      booking: bookingId,
      room: roomId,
      guest: req.user._id,
      requestType,
      description,
      status: 'pending'
    });

    return successResponse(res, 201, 'Service request submitted', request);
  } catch (err) {
    next(err);
  }
};

const updateServiceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updates = { status };
    if (status === 'resolved') {
      updates.resolvedBy = req.user._id;
      updates.resolvedAt = new Date();
    }

    const request = await ServiceRequest.findByIdAndUpdate(id, updates, { new: true });
    if (!request) {
      return errorResponse(res, 404, 'Service request not found');
    }

    return successResponse(res, 200, 'Service request updated', request);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyOperations,
  getArrivals,
  getDepartures,
  checkInGuest,
  checkOutGuest,
  updateRoomPhysicalStatus,
  getHousekeepingTasks,
  createHousekeepingTask,
  updateHousekeepingTask,
  getServiceRequests,
  createServiceRequest,
  updateServiceRequest
};
