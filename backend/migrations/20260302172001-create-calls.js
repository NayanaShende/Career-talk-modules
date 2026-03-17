'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calls', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      caller_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('initiated', 'accepted', 'rejected', 'ended', 'missed'),
        defaultValue: 'initiated',
      },
      started_at: {
        type: Sequelize.DATE,
      },
      ended_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('calls');
  },
};