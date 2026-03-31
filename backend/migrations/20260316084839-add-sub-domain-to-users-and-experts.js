'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Users', 'sub_domain', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
    } catch (error) {
      console.log('Column sub_domain might already exist in Users');
    }

    try {
      // ✅ Experts table (capital E — Sequelize default)
      await queryInterface.addColumn('Experts', 'sub_domain', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
    } catch (error) {
      console.log('Column sub_domain might already exist in Experts');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'sub_domain');
    await queryInterface.removeColumn('Experts', 'sub_domain');
  }
};