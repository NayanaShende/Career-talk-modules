jest.mock("../../src/repositories/auth.repository");
jest.mock("../../src/repositories/expert.repository");
jest.mock("jsonwebtoken");

const authRepo = require("../../src/repositories/auth.repository");
const expertRepo = require("../../src/repositories/expert.repository");
const jwt = require("jsonwebtoken");

const authService = require("../../src/services/auth.service");

describe("Auth Service", () => {

  beforeEach(() => jest.clearAllMocks());

  test("should send OTP", async () => {
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue({ id: 1 });

    const result = await authService.sendOtp("9999999999");

    expect(result).toHaveProperty("otp");
  });

});