const { z } = require('zod');

const createBookingSchema = z
  .object({
    roomId: z.string().min(1, 'Room ID is required'),
    checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Check-in date must be a valid date'
    }),
    checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Check-out date must be a valid date'
    }),
    guests: z
      .object({
        adults: z.coerce.number().int().min(1).default(1),
        children: z.coerce.number().int().min(0).default(0)
      })
      .default({ adults: 1, children: 0 }),
    guestDetails: z.object({
      fullName: z.string().trim().min(2, 'Guest full name is required'),
      email: z.string().trim().toLowerCase().email('Valid guest email is required'),
      phone: z.string().trim().min(7, 'Valid contact phone is required'),
      specialRequests: z.string().max(500).optional().default('')
    }),
    paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet', 'sandbox']).default('sandbox')
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOutDate']
    }
  );

const cancelBookingSchema = z.object({
  reason: z.string().trim().min(3, 'Please provide a reason for cancellation').max(300)
});

module.exports = {
  createBookingSchema,
  cancelBookingSchema
};
