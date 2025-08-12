const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { insertTable, updateTable, deleteTable, getAll, getById } = require('../controllers/handlerFactory');
const Project = require('../models/projectModel');
const { fetch_user } = require('../middlewares/fetch_user');
const { sendNotification } = require('../utils/notify');
const { projectdData } = require('../controllers/projectController');
const validateProjectFields = [
  body('name')
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
  body('description')
    .notEmpty().withMessage('Description is required')

];
// Add new project
router.post(
  '/project',
  fetch_user,
  validateProjectFields,
  async (req, res) => {
    try {
      const io = req.app.get('io');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("userid:", req.id);

      // Attach ownerId
      const projectData = {
        ...req.body,
        ownerId: req.id
      };

      // Insert project into DB
      const newProject = await Project.create(projectData);

      // ✅ Eager load owner (User) right after creation
      const projectWithOwner = await Project.findByPk(newProject.id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'fullName', 'email'] // You can modify what you want to return
          }
        ]
      });

      // ✅ Send notification
      await sendNotification(req, "New Project Added", req.id, newProject.id);

      // ✅ Return the project with populated owner
      res.status(201).json({ success: true, project: projectWithOwner });
    } catch (err) {
      console.error('Error in creating project:', err);
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);



// Update project
router.put('/project/:id', (req, res) => {
  updateTable(res, Project, req.body, { id: req.params.id });
});

// Delete project
router.delete('/project/:id', (req, res) => {
  deleteTable(res, Project, { id: req.params.id });
});

// Get all projects
router.get('/project', (req, res) => {
  getAll(res, Project);
});

// Get one project by ID
router.get('/project/:id', (req, res) => {
  getById(res, Project, { id: req.params.id });
});


// joined  table  data
const ProjectMembers = require('../models/projectMembers');
const Task = require('../models/taskModel');
const User = require('../models/userModel');

// router.get('/projects/:id',projectdData)

router.get('/projectsData', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        // Project owner
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'fullName', 'email','profilePhoto']
        },
        // Project members (many-to-many via ProjectMembers)
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'fullName', 'email','profilePhoto'],
          through: {
            attributes: [] // Hide join table
          }
        },
        // Project tasks
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              attributes: ['id', 'fullName']
            }
          ]
        }
      ]
    });

    res.json({ data: projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project data' });
  }
});

router.get('/projectsData/:id', async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findOne({
      where: { id: projectId },
      include: [
        // Project owner
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'fullName', 'email','profilePhoto']
        },
        // Project members (many-to-many via ProjectMembers)
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'fullName', 'email','profilePhoto'],
          through: {
            attributes: [] // Hide join table
          }
        },
        // Project tasks
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              attributes: ['id', 'fullName']
            }
          ]
        }
      ]
    });

    res.json({ data: project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project data' });
  }
});




module.exports = router