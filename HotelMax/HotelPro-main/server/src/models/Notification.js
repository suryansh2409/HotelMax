const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    roleTarget: {
      type: String,
      enum: ['customer', 'staff', 'admin', 'all'],
      default: 'customer',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['booking', 'payment', 'cancellation', 'housekeeping', 'service_request', 'system'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
