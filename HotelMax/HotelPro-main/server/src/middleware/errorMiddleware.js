const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return errorResponse(res, 404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return errorResponse(res, 409, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 400, 'Validation Error', message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token');
  }

  // Explicit CORS policy rejection
  if (err.message && err.message.includes('CORS')) {
    return errorResponse(res, 403, err.message);
  }

  const statusCode =
    error.statusCode ||
    err.statusCode ||
    (res.statusCode >= 400 ? res.statusCode : 500);

  return errorResponse(
    res,
    statusCode,
    error.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

const notFound = (req, res, next) => {
  return errorResponse(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

module.exports = { errorHandler, notFound };
