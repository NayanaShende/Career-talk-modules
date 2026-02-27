jest.mock("../../src/repositories/user.repository");

const userRepo = require("../../src/repositories/user.repository");
const userService = require("../../src/services/user.service");

describe("User Service", () => {

  test("should generate OTP", async () => {
    const fakeUser = { save: jest.fn() };

    userRepo.findUserByMobile.mockResolvedValue(fakeUser);

    const otp = await userService.generateOtp("9999999999");

    expect(otp).toHaveLength(6);
  });

});