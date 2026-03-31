'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Experts', 'rate_per_minute', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10, // default 10 per minute
      });
    } catch (e) {
      console.log('rate_per_minute already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Experts', 'rate_per_minute');
    } catch (e) {
      console.log('rate_per_minute already removed');
    }
  }
};