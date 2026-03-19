'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    // ✅ Users table (capital U — Sequelize default)
    await queryInterface.addColumn('Users', 'sub_domain', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
    });

    // ✅ Experts table (capital E — Sequelize default)
    await queryInterface.addColumn('Experts', 'sub_domain', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'sub_domain');
    await queryInterface.removeColumn('Experts', 'sub_domain');
  }
};