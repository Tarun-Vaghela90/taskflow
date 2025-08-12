const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const { insertTable, updateTable, deleteTable, getAll, getById } = require('../controllers/handlerFactory');
const { fetch_user } = require('../middlewares/fetch_user');
const {is_Admin} = require('../middlewares/is_Admin')
const { sendNotification } = require('../utils/notify');
const router = express.Router();
const fs = require('fs');


const multer = require('multer');
const path = require('path');
const { updateTaskStatus, getProjectTasks, toggleTaskTimer } = require('../controllers/taskController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tasks/');
  },
  filename: (req, file, cb) => {
    cb(null, `task-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });


const validateTaskFields = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('status').optional().isString(),
  body('projectId').isInt().withMessage('Project ID must be an integer')
];
router.use('/', fetch_user)
router.post('/', upload.single('attachment'), validateTaskFields, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const allowedStatus = ['TODO', 'IN_PROGRESS', 'DONE'];
    const status = allowedStatus.includes(req.body.status?.toUpperCase()) 
      ? req.body.status.toUpperCase() 
      : 'TODO';

    const taskData = {
      ...req.body,
      status: status,
      createdBy: req.id,
      assignedTo: req.body.assignedTo,
      attachment: req.file ? req.file.filename : null
    };

    insertTable(res, Task, taskData);

    const targetUserId = req.body.assignedTo || req.id;
    const projectId = req.body.projectId;
    await sendNotification(req, "New Task Assigned", targetUserId, projectId);
  } catch (error) {
    console.error("Error creating task:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Task creation failed" });
  }
});


router.get('/', (req, res) => getAll(res, Task));
// router.get('/:id', async (req, res) => {
//   try {
//     const task = await Task.findOne({
//       where: { id: req.params.id },
//       include: [
//         {
//           model: Project,
//           as: 'project',
//           attributes: ['id', 'name'], // ✅ project name instead of just ID
//         },
//         {
//           model: User, // creator (createdBy)
//           attributes: ['id', 'fullName', 'email'],
//           foreignKey: 'createdBy',
//         },
//         {
//           model: User, // assignedTo
//           attributes: ['id', 'fullName', 'email'],
//           foreignKey: 'assignedTo',
//         }
//       ]
//     });

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     res.json(task);
//   } catch (error) {
//     console.error('Error fetching task:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'creator', // task creator
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: User, // assigned user
          foreignKey: 'assignedTo',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Project,
          as: 'project', // alias from your association
          attributes: ['id', 'name'], // only fetch what you need
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', validateTaskFields, async (req, res) => updateTable(res, Task, req.body, { id: req.params.id }));
router.delete('/:id', (req, res) => deleteTable(res, Task, { id: req.params.id }));


router.post('/task/:id/timer',  toggleTaskTimer);
router.patch('/:id/status', updateTaskStatus);
router.get('/projectTask/:projectId', getProjectTasks);

module.exports = router;
