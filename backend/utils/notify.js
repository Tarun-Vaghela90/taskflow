const Notification = require('../models/notificationModel');


const sendNotification = async (req, message, userId, projectId = null) => {
  try {
    const io = req.app.get('io');

    const notification = await Notification.create({
      message,
      userId,
      projectId
    });

    io.emit('notification', {
      message,
      userId,
      projectId,
      createdAt: notification.createdAt
    });
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
  }
};

module.exports = { sendNotification };
