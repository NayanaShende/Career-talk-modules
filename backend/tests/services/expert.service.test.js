jest.mock("../../src/repositories/expert.repository");

const expertRepo = require("../../src/repositories/expert.repository");
const expertService = require("../../src/services/expert.service");

describe("Expert Service", () => {

  test("should get experts", async () => {
    expertRepo.findAllExperts.mockResolvedValue([{ id: 1 }]);

    const result = await expertService.getAllExperts();

    expect(result.length).toBe(1);
  });

});