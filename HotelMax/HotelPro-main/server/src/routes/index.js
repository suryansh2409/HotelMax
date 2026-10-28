const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const staffRoutes = require('./staffRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/health', healthRoutes);

module.exports = router;
