const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const env = require('../config/env');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { recordAuditLog } = require('../middleware/auditMiddleware');

/**
 * Generate JWT Token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

/**
 * Register a new customer
 * (Public registration is STRICTLY limited to 'customer' role)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Explicitly enforce role as 'customer'
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'customer'
    });

    const token = generateToken(user._id, user.role);

    recordAuditLog({
      user,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      req
    });

    return successResponse(res, 201, 'Account created successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is deactivated. Please contact hotel administration.');
    }

    if (!user.password) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    const token = generateToken(user._id, user.role);

    recordAuditLog({
      user,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email },
      req
    });

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user profile with summary stats
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Get customer booking summary
    const [totalBookings, activeBookings, cancelledBookings] = await Promise.all([
      Booking.countDocuments({ user: user._id }),
      Booking.countDocuments({ user: user._id, status: { $in: ['confirmed', 'checked_in'] } }),
      Booking.countDocuments({ user: user._id, status: 'cancelled' })
    ]);

    return successResponse(res, 200, 'Profile retrieved', {
      user,
      stats: {
        totalBookings,
        activeBookings,
        cancelledBookings
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 400, 'Current password is required to set a new password');
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return errorResponse(res, 400, 'Current password is incorrect');
      }
      user.password = newPassword;
    }

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
