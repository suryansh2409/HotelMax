const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    provider: {
      type: String,
      enum: ['sandbox', 'razorpay', 'stripe'],
      default: 'sandbox'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'sandbox'],
      default: 'card'
    },
    cardLast4: {
      type: String,
      maxlength: 4
    },
    cardBrand: {
      type: String,
      default: 'Visa'
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'captured', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    signature: {
      type: String
    },
    refundDetails: {
      refundId: { type: String },
      amount: { type: Number },
      refundedAt: { type: Date },
      reason: { type: String }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
