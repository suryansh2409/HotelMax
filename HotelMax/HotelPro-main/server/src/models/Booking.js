const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
      index: true
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      index: true
    },
    totalNights: {
      type: Number,
      required: true,
      min: [1, 'Booking must be for at least one night']
    },
    guests: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      totalGuests: { type: Number, default: 1, min: 1 }
    },
    guestDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      specialRequests: { type: String, default: '' }
    },
    // Exact snapshots so historical billing stays accurate
    priceBreakdown: {
      nightlyRate: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxes: { type: Number, required: true },
      cleaningFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true }
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending_payment',
          'confirmed',
          'checked_in',
          'completed',
          'cancellation_requested',
          'cancelled',
          'payment_failed'
        ],
        message: '{VALUE} is not a valid booking status'
      },
      default: 'pending_payment',
      index: true
    },
    cancellation: {
      reason: { type: String },
      requestedAt: { type: Date },
      processedAt: { type: Date },
      refundAmount: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['none', 'pending', 'processed', 'rejected'],
        default: 'none'
      }
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    checkedInAt: {
      type: Date
    },
    checkedOutAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index to accelerate date-overlap queries
bookingSchema.index({ room: 1, status: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
