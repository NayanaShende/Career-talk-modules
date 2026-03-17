'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('calls', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('calls', 'total_amount', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('calls', 'duration');
    await queryInterface.removeColumn('calls', 'total_amount');
  }
};