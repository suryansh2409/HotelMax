const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createReviewSchema } = require('../validators/reviewValidators');

router.post('/', protect, validate(createReviewSchema), reviewController.createReview);
router.get('/room/:roomId', reviewController.getRoomReviews);

module.exports = router;
