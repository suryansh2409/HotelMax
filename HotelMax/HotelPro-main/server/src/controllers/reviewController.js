const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Submit a review for an eligible stay
 */
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, title, comment } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.user.toString() !== req.user.id) {
      return errorResponse(res, 403, 'You can only review reservations made under your account.');
    }

    // Check if stay is eligible (confirmed, checked_in, or completed)
    if (!['confirmed', 'checked_in', 'completed'].includes(booking.status)) {
      return errorResponse(res, 400, 'Reviews can only be submitted for confirmed or completed stays.');
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return errorResponse(res, 400, 'You have already reviewed this stay.');
    }

    const review = await Review.create({
      booking: booking._id,
      room: booking.room._id,
      hotel: booking.hotel || booking.room.hotel,
      user: req.user._id,
      rating,
      title: title || 'Great stay',
      comment,
      isApproved: true
    });

    return successResponse(res, 201, 'Review submitted successfully', review);
  } catch (err) {
    next(err);
  }
};

/**
 * Get approved reviews for a room
 */
const getRoomReviews = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const reviews = await Review.find({ room: roomId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Room reviews retrieved', reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getRoomReviews
};
