jest.mock("../src/models", () => ({
  sequelize: {},
  Sequelize: {},
  User: {},
  Expert: {},
  ExpertSkill: {}
}));