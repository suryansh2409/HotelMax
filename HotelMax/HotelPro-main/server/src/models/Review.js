const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per eligible completed booking
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: 1000
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ room: 1, isApproved: 1, createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
