const express = require('express');
const router = express.Router();
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const ProjectMember = require('../models/projectMembers');
const { Op } = require("sequelize");
const { sequelize } = require('../db_connect');

// GET /api/projects/:projectId/overview

router.get("/:projectId/overview", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch base project info + associations
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "fullName", "email", "profilePhoto"],
        },
        {
          model: User,
          as: "teamMembers",
          attributes: ["id", "fullName", "email", "profilePhoto"],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Aggregate task counts
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] =
      await Promise.all([
        Task.count({ where: { projectId } }),
        Task.count({ where: { projectId, status: "DONE" } }),
        Task.count({ where: { projectId, status: "IN_PROGRESS" } }),
        Task.count({
          where: {
            projectId,
            dueDate: { [Op.lt]: new Date() },
            status: { [Op.ne]: "DONE" },
          },
        }),
      ]);

    res.json({
      projectOverview: {
        id: project.id,
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        createdAt: project.createdAt, // ✅ Added
        updatedAt: project.updatedAt, // optional
        owner: project.owner,
        teamMembers: project.teamMembers,
      },
      taskSummary: {
        totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        overdue: overdueTasks,
      },
    });
  } catch (error) {
    console.error("Error fetching project overview:", error);
    res.status(500).json({ error: "Failed to fetch project overview" });
  }
});



 // Adjust path to your Task model

// GET /api/projects/:projectId/task-status
router.get('/:projectId/task-status', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Query tasks grouped by status
    const taskCounts = await Task.findAll({
      where: { projectId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Define the enum order we want in the chart
    const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE'];

    // Format the data in Chart.js-friendly form
    const result = statusOrder.map(status => {
      const found = taskCounts.find(t => t.status === status);
      return found ? parseInt(found.dataValues.count, 10) : 0;
    });

    res.json({
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [
        {
          label: 'Tasks by Status',
          data: result,
          backgroundColor: ['#f39c12', '#3498db', '#2ecc71']
        }
      ]
    });

  } catch (error) {
    console.error('Error fetching task status data:', error);
    res.status(500).json({ error: 'Failed to fetch task status data' });
  }
});

module.exports = router;
