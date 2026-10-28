const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Log audit events to database asynchronously
 */
const recordAuditLog = async ({ user, action, entity, entityId, details, req }) => {
  try {
    const ipAddress = req ? req.headers['x-forwarded-for'] || req.socket.remoteAddress : 'unknown';
    await AuditLog.create({
      user: user ? user._id || user.id : null,
      userName: user ? user.name : 'System',
      userRole: user ? user.role : 'system',
      action,
      entity,
      entityId: entityId ? entityId.toString() : null,
      details,
      ipAddress
    });
  } catch (err) {
    logger.error('Failed to write audit log', err);
  }
};

module.exports = { recordAuditLog };
