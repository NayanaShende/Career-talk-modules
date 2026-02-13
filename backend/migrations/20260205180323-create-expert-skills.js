'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ExpertSkills', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      expert_id: {
        type: Sequelize.INTEGER,   
        allowNull: false,
        references: {
          model: 'Experts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      skill_name: Sequelize.STRING,

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ExpertSkills');
  }
};
