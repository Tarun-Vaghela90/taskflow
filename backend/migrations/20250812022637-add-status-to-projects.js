'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Projects', 'status', {
      type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'hold','archived'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // First remove the column
    await queryInterface.removeColumn('Projects', 'status');

    // Then drop the ENUM type (needed for Postgres)
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Projects_status";');
    }
  }
};
