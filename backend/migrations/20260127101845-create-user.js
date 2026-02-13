'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      role: {
        type: Sequelize.ENUM('jobseeker', 'expert', 'admin'),
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      email: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: true
      },
      mobile: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: false
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experience_level: {
        type: Sequelize.ENUM('fresher', 'junior', 'mid', 'senior'),
        allowNull: false
      },
      skills: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false
      },
      resume_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  }
};
