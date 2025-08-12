const express = require("express");
const { sequelize, db_connect } = require('./db_connect');
require('dotenv').config();

const app = express();
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const path = require('path');
app.use('/uploads/users', express.static(path.join(__dirname, 'uploads/users')));
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

db_connect();

// Models
const Project = require('./models/projectModel');
const Task = require('./models/taskModel');
const User = require('./models/userModel');
const ProjectMembers = require("./models/projectMembers");
const Comment = require('./models/commentModel');
const Notification = require('./models/notificationModel');

// Routes
const userRoutes = require('./routes/userRoutes');
const ProjectRoutes = require('./routes/projectRoutes');
const ProjectMembersRoutes = require('./routes/projectMemberRoutes');
const NotificationRoutes = require('./routes/notificationRoutes');
const CommentRoutes = require('./routes/commentRoutes');
const TaskRoutes = require('./routes/taskRoutes');
const  DashboardRoutes = require('./routes/dashboardRoutes')
// ==============================
// Associations
// ==============================

// User → Projects (Owner)
User.hasMany(Project, {
  foreignKey: 'ownerId',
  as: 'projects',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Project.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});

// Many-to-Many: User ↔ Project via ProjectMembers
User.belongsToMany(Project, {
  through: ProjectMembers,
  foreignKey: 'userId',
  as: 'memberProjects',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Project.belongsToMany(User, {
  through: ProjectMembers,
  foreignKey: 'projectId',
  as: 'teamMembers',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Project → Tasks
Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

// Task → Comments
Task.hasMany(Comment, {
  foreignKey: 'taskId',
  as: 'taskComments',
  onDelete: 'CASCADE',
});
Task.belongsTo(User, {
  foreignKey: 'createdBy', // column in Task table
  as: 'creator',           // alias for creator
  onDelete: 'SET NULL',
});
Comment.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task',
});

// Task → Assigned User
Task.belongsTo(User, {
  foreignKey: 'assignedTo',
  onDelete: 'SET NULL',
});

// User → Comments
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

// Project → Comments
Project.hasMany(Comment, {
  foreignKey: 'projectId',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

// User → Notifications
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE',
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'receiver',
});

// Project → Notifications
Project.hasMany(Notification, {
  foreignKey: 'projectId',
  as: 'notifications',
  onDelete: 'CASCADE',
});
Notification.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'relatedProject',
});

// ==============================
// Middleware
// ==============================
app.use(express.json());
app.use(cors());

// ==============================
// Sequelize Sync
// ==============================
sequelize.sync().then(() => {
  console.log("✅ DB sync successful");
}).catch((err) => {
  console.error("❌ DB sync failed", err);
});

// ==============================
// WebSockets
// ==============================
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});
app.set('io', io);

// ==============================
// Routes
// ==============================
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', ProjectRoutes);
app.use('/api/v1/tasks', TaskRoutes);
app.use('/api/v1/comments', CommentRoutes);
app.use('/api/v1/notifications', NotificationRoutes);
app.use('/api/v1/projectmembers', ProjectMembersRoutes);
app.use('/api/v1/dashboard',DashboardRoutes)

// ==============================
// Start Server
// ==============================
server.listen(3000,"0.0.0.0", () => {
  console.log('🚀 Server is running on http://localhost:3000');
});
