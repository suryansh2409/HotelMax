const { z } = require('zod');

const createRoomSchema = z.object({
  roomNumber: z.string().trim().min(1, 'Room number is required'),
  title: z.string().trim().min(3, 'Room title must be at least 3 characters'),
  type: z.enum(['single', 'double', 'deluxe', 'suite', 'presidential'], {
    errorMap: () => ({ message: 'Invalid room category' })
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.coerce.number().positive('Base price must be greater than zero'),
  seasonalPriceMultiplier: z.coerce.number().min(0.5).max(3.0).default(1.0),
  capacity: z.object({
    adults: z.coerce.number().int().min(1).default(2),
    children: z.coerce.number().int().min(0).default(0),
    maxGuests: z.coerce.number().int().min(1).default(2)
  }),
  bedType: z.string().default('King Size Bed'),
  sizeSqFt: z.coerce.number().positive().default(400),
  amenities: z.array(z.string()).default([]),
  photos: z.array(z.string().url()).min(1, 'At least one photo URL is required'),
  physicalStatus: z.enum(['available', 'occupied', 'cleaning', 'maintenance']).default('available'),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

const updateRoomSchema = createRoomSchema.partial();

module.exports = {
  createRoomSchema,
  updateRoomSchema
};
