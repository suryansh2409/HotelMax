const { errorResponse } = require('../utils/responseHelper');

const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req[source]);
      req[source] = validated;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return errorResponse(res, 400, 'Validation failed', formattedErrors);
      }
      return errorResponse(res, 400, err.message);
    }
  };
};

module.exports = { validate };
