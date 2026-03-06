module.exports = {
  async up(queryInterface, Sequelize) {
    

    await queryInterface.addColumn("Users", "portfolio", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("Users", "expertise", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("Users", "company", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("Users", "linkedin", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("Users", "hourlyRate", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface) {
    
    await queryInterface.removeColumn("Users", "portfolio");
    await queryInterface.removeColumn("Users", "expertise");
    await queryInterface.removeColumn("Users", "company");
    await queryInterface.removeColumn("Users", "linkedin");
    await queryInterface.removeColumn("Users", "hourlyRate");
  },
};
