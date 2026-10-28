const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 2. Check HttpOnly cookie
    token = req.cookies.token;
  }

  if (!token) {
    return errorResponse(res, 401, 'Access denied. Please log in to proceed.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'User account associated with this token no longer exists.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is currently deactivated. Please contact support.');
    }

    // Attach user to request object (strip password)
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Session expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Invalid authentication token.');
  }
};

/**
 * Grant access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
