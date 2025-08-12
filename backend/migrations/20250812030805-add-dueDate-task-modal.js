// migrations/20250812XXXXXX-add-dueDate-to-tasks.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tasks', 'dueDate', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'status' // places column after "status" if supported by DB
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'dueDate');
  }
};
