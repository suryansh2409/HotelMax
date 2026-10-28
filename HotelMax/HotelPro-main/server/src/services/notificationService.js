const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const sendNotification = async ({
  recipient = null,
  roleTarget = 'customer',
  title,
  message,
  type = 'system',
  link = '',
  metadata = {}
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      roleTarget,
      title,
      message,
      type,
      link,
      metadata
    });
    return notification;
  } catch (err) {
    logger.error('Failed to create in-app notification', err);
    return null;
  }
};

module.exports = {
  sendNotification
};
