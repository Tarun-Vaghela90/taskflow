const { DataTypes } = require('sequelize');
const { sequelize } = require('../db_connect');

const ProjectMembers = sequelize.define('ProjectMembers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // ✅ Make it required
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false, // ✅ Make it required
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
    addedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
  
}, {
  timestamps: true // or true, depending on whether you want to track when added
});

module.exports = ProjectMembers;
