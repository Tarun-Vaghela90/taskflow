// taskController.js
const Task = require('../models/taskModel');



// controllers/taskController.js

exports.toggleTaskTimer = async (req, res) => {
  console.log("Toggle task timer route hit");

  const taskId = req.params.id;   // /tasks/:id/timer
  const userId = req.id;          // from auth middleware
  const isAdmin = req.isAdmin;    // from auth middleware
  const { action } = req.body;    // 'start' or 'stop'

  try {
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission check
    if (!isAdmin && task.createdBy !== userId && task.assignedTo !== userId) {
      return res.status(403).json({ message: 'Not authorized to control timer for this task' });
    }

    const now = new Date();

    // Start timer
    // Start timer
if (action === 'start') {
  if (task.startedAt) {
    // Already running → just return current timer state
    return res.status(200).json({
      status: 'success',
      data: {
        taskId: task.id,
        elapsedTime: task.elapsedTime,
        startedAt: task.startedAt,
        stoppedAt: task.stoppedAt,
        isRunning: true
      }
    });
  }
  task.startedAt = now;
}

    // Stop timer
    if (action === 'stop') {
      if (!task.startedAt) {
        return res.status(400).json({ message: 'Timer is not running for this task' });
      }
      const timeDiff = Math.floor((now - new Date(task.startedAt)) / 1000);
      task.elapsedTime = (task.elapsedTime || 0) + timeDiff;
      task.startedAt = null;
      task.stoppedAt = now;
    }

    await task.save();

    res.status(200).json({
      status: 'success',
      data: {
        taskId: task.id,
        elapsedTime: task.elapsedTime,
        startedAt: task.startedAt,
        stoppedAt: task.stoppedAt
      }
    });
  } catch (error) {
    console.error('Error toggling task timer:', error);
    res.status(500).json({ message: 'Failed to toggle task timer' });
  }
};



// exports.updateTaskStatus = async (req, res) => {
//   console.log("Update task status route hit");

//   const { status } = req.body;
//   const taskId = req.params.id; // route param :id
//   const userId = req.id;        // from auth middleware
//   const isAdmin = req.isAdmin;  // from auth middleware

//   try {
//     const task = await Task.findByPk(taskId);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Permission check
//     if (!isAdmin && task.createdBy !== userId && task.assignedTo !== userId) {
//       return res.status(403).json({ message: 'Not authorized to update this task' });
//     }

//     const now = new Date();

//     // Start timer if moving to IN_PROGRESS
//     if (status === 'IN_PROGRESS' && task.status !== 'IN_PROGRESS') {
//       task.startedAt = now;
//     }

//     // Stop timer & update elapsed time if moving from IN_PROGRESS
//     if ((status === 'TODO' || status === 'DONE') && task.status === 'IN_PROGRESS' && task.startedAt) {
//       const timeDiff = Math.floor((now - new Date(task.startedAt)) / 1000);
//       task.elapsedTime = (task.elapsedTime || 0) + timeDiff;
//       task.startedAt = null;
//       task.stoppedAt = now;
//     }

//     task.status = status;
//     await task.save();

//     res.status(200).json({ status: 'success', data: task });
//   } catch (error) {
//     console.error('Error updating task status:', error);
//     res.status(500).json({ message: 'Failed to update task status' });
//   }
// };



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

    // ✅ Just update the status
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
