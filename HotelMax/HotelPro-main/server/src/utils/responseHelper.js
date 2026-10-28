/**
 * Standardized API response format for HotelPro
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const errorResponse = (res, statusCode = 500, message = 'An unexpected error occurred', errors = null) => {
  const payload = {
    success: false,
    message,
    errors
  };

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
