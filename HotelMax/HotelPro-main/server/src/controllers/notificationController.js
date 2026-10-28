const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Get current user's notifications
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { recipient: req.user._id },
        { roleTarget: req.user.role },
        { roleTarget: 'all' }
      ]
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    return successResponse(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a single notification or all as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany(
        {
          $or: [
            { recipient: req.user._id },
            { roleTarget: req.user.role },
            { roleTarget: 'all' }
          ],
          isRead: false
        },
        { isRead: true }
      );
      return successResponse(res, 200, 'All notifications marked as read');
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};
