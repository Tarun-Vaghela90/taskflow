const  {Sequelize,DataTypes} =  require('sequelize')
const { sequelize}  = require('../db_connect');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profilePhoto: { // ✅ New field
    type: DataTypes.STRING, // store file path or URL
    allowNull: true
  },
  resetToken: {
  type: DataTypes.STRING,
  allowNull: true
},
resetTokenExpires: {
  type: DataTypes.DATE,
  allowNull: true
}

}, {
  timestamps: true 
});

module.exports = User