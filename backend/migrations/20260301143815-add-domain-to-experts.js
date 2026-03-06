module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Experts", "domain", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Experts", "domain");
  },
};
