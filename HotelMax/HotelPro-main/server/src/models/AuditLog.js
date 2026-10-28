const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String
    },
    userRole: {
      type: String
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entity: {
      type: String,
      required: true,
      index: true
    },
    entityId: {
      type: String
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
