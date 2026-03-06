'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Experts', 'rate_per_minute', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10, // default 10 per minute
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Experts', 'rate_per_minute');
  }
};