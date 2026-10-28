const { z } = require('zod');

const processPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet', 'sandbox']).default('card'),
  cardLast4: z.string().max(4).optional().default('4242'),
  cardBrand: z.string().optional().default('Visa'),
  gatewayOrderId: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional()
});

module.exports = {
  processPaymentSchema
};
