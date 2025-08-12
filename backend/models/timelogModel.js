const { DataTypes } = require('sequelize');
const { sequelize } = require('../db_connect');

const TimeLog = sequelize.define('TimeLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true  // It may be null if the timer is still running
  },
  duration: {
    type: DataTypes.INTEGER, // duration in minutes or seconds (your choice)
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = TimeLog;
