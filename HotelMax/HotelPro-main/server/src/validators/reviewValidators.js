const { z } = require('zod');

const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking reference is required'),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional().default('Wonderful Stay'),
  comment: z.string().trim().min(5, 'Review must be at least 5 characters').max(1000)
});

module.exports = {
  createReviewSchema
};
