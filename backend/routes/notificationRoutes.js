const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/notificationModel');
const { insertTable, updateTable, deleteTable, getAll, getById } = require('../controllers/handlerFactory');

const router = express.Router();

const validateNotificationFields = [
  body('message').notEmpty(),
  body('userId').isInt(),
  body('projectId').optional().isInt(),
  body('isRead').optional().isBoolean()
];

router.post('/', validateNotificationFields, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  insertTable(res, Notification, req.body);
});

router.get('/', (req, res) => getAll(res, Notification));
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']], // newest first
    });

    res.json({ status: 'success', data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
  }
});
router.put('/:id', validateNotificationFields, async (req, res) => updateTable(res, Notification, req.body, { id: req.params.id }));
router.delete('/:id', (req, res) => deleteTable(res, Notification, { id: req.params.id }));

module.exports = router;
