const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    requestType: {
      type: String,
      enum: ['room_service', 'cleaning', 'extra_towels', 'maintenance', 'wakeup_call', 'luggage_assistance', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      required: [true, 'Please provide details for the service request']
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'cancelled'],
      default: 'pending',
      index: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);
