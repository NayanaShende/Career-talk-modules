'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Experts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: Sequelize.STRING,
      headline: Sequelize.STRING,
      bio: Sequelize.TEXT,
      experience_years: Sequelize.INTEGER,
      verified: Sequelize.BOOLEAN,

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Experts');
  }
};
