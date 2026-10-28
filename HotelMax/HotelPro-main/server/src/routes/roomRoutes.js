const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createRoomSchema, updateRoomSchema } = require('../validators/roomValidators');

// Public room browsing and availability routes
router.get('/', roomController.getRooms);
router.get('/featured', roomController.getFeaturedRooms);
router.get('/:id', roomController.getRoomById);
router.post('/calculate-price', roomController.calculatePrice);

// Admin-only management routes
router.post('/', protect, authorize('admin'), validate(createRoomSchema), roomController.createRoom);
router.put('/:id', protect, authorize('admin'), validate(updateRoomSchema), roomController.updateRoom);
router.delete('/:id', protect, authorize('admin'), roomController.deleteRoom);

module.exports = router;
