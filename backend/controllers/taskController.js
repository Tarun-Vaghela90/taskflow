// taskController.js
const Task = require('../models/taskModel');

exports.updateTaskStatus = async (req, res) => {
  console.log("Update task status route hit");

  const { status } = req.body;
  const taskId = req.params.id; // route param :id
  const userId = req.id;        // from auth middleware
  const isAdmin = req.isAdmin;  // from auth middleware

  try {
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission check
    if (!isAdmin && task.createdBy !== userId && task.assignedTo !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const now = new Date();

    // Start timer if moving to IN_PROGRESS
    if (status === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') {
      task.startedAt = now;
    }

    // Stop timer & update elapsed time if moving from IN_PROGRESS
    if ((status === 'TODO' || status === 'DONE') && task.status === 'IN_PROGRESS' && task.startedAt) {
      const timeDiff = Math.floor((now - new Date(task.startedAt)) / 1000);
      task.elapsedTime = (task.elapsedTime || 0) + timeDiff;
      task.startedAt = null;
      task.stoppedAt = now;
    }

    task.status = status;
    await task.save();

    res.status(200).json({ status: 'success', data: task });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status' });
  }
};

exports.getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await Task.findAll({
      where: { projectId }, // Filter by projectId
      attributes: ['title', 'description', 'status', 'attachment', 'createdBy', 'assignedTo']
    });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
    });
  }
};
