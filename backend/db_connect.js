const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('taskflow', 'root', 'tarun', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
   define: {
    paranoid: true, // global soft delete
  },
});

const db_connect = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
  }
};

module.exports = { sequelize, db_connect };
