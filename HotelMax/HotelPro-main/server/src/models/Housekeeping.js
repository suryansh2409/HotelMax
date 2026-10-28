const mongoose = require('mongoose');

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    taskType: {
      type: String,
      enum: ['cleaning', 'maintenance', 'inspection', 'turndown'],
      default: 'cleaning'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Housekeeping || mongoose.model('Housekeeping', housekeepingSchema);
