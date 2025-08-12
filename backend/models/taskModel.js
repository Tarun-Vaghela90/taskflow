const { DataTypes } = require('sequelize');
const { sequelize } = require('../db_connect');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
    allowNull: false,
    defaultValue: 'TODO'
  },
  attachment: {
    type: DataTypes.STRING,  // This will store the file path or filename
    allowNull: true
  },
  dueDate: {
  type: DataTypes.DATE,
  allowNull: true,
},
  projectId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Projects',
      key: 'id'
    },
    allowNull: false
  },

  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  stoppedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  elapsedTime: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  stoppedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  elapsedTime: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users', // Make sure this matches the actual table name
      key: 'id'
    }
  },

  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Task;
