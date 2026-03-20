"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Users");

    // ✅ Only add column if it doesn't already exist
    if (!tableDescription.skills) {
      await queryInterface.addColumn("Users", "skills", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableDescription.preferred_job_role) {
      await queryInterface.addColumn("Users", "preferred_job_role", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableDescription.current_status) {
      await queryInterface.addColumn("Users", "current_status", {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "skills");
    await queryInterface.removeColumn("Users", "preferred_job_role");
    await queryInterface.removeColumn("Users", "current_status");
  },
};