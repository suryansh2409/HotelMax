const { z } = require('zod');

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 characters')
      .max(20, 'Phone number cannot exceed 20 characters'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
  avatar: z.string().url().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};
