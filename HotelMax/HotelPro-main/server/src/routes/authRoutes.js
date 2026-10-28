const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/authValidators');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Public authentication routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected profile routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
