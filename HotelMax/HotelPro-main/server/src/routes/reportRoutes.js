const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/bookings/csv', reportController.exportBookingsCsv);
router.get('/revenue/csv', reportController.exportRevenueCsv);

module.exports = router;
