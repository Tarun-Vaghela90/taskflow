'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // List all the tables that need soft delete
    const tables = [
      'Users',
      'Projects',
      'Tasks',
      // add all your table names here (case-sensitive!)
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'Users',
      'Projects',
      'Tasks',
      
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, 'deletedAt');
    }
  },
};
