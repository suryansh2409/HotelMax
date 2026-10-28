const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin endpoints strictly require 'admin' role
router.use(protect, authorize('admin'));

// Dashboard metrics & Recharts analytics
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalyticsData);

// Bookings management
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// Users & Staff management
router.get('/users', adminController.getAllUsers);
router.post('/users/staff', adminController.createStaffAccount);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
