const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { processPaymentSchema } = require('../validators/paymentValidators');

// Customer payment submission
router.post('/process', protect, validate(processPaymentSchema), paymentController.processPayment);

// Admin-only refund execution
router.post('/refund/:bookingId', protect, authorize('admin'), paymentController.processAdminRefund);

module.exports = router;
