const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createBookingSchema, cancelBookingSchema } = require('../validators/bookingValidators');

// Protected customer booking routes
router.post('/', protect, validate(createBookingSchema), bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getMyBookings);
router.get('/:reference', protect, bookingController.getBookingByReference);
router.post('/:id/cancel', protect, validate(cancelBookingSchema), bookingController.cancelBooking);
router.get('/:id/invoice', protect, bookingController.getInvoice);

module.exports = router;
