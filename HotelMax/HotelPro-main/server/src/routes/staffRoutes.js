const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All staff endpoints require either 'staff' or 'admin' role
router.use(protect, authorize('staff', 'admin'));

// Daily operations & summaries
router.get('/operations', staffController.getDailyOperations);
router.get('/arrivals', staffController.getArrivals);
router.get('/departures', staffController.getDepartures);

// Check-in and Check-out
router.post('/bookings/:id/check-in', staffController.checkInGuest);
router.post('/bookings/:id/check-out', staffController.checkOutGuest);

// Physical room status
router.put('/rooms/:id/status', staffController.updateRoomPhysicalStatus);

// Housekeeping dispatch & management
router.get('/housekeeping', staffController.getHousekeepingTasks);
router.post('/housekeeping', staffController.createHousekeepingTask);
router.put('/housekeeping/:id', staffController.updateHousekeepingTask);

// Service requests
router.get('/service-requests', staffController.getServiceRequests);
router.post('/service-requests', staffController.createServiceRequest);
router.put('/service-requests/:id', staffController.updateServiceRequest);

module.exports = router;
