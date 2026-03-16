// tests/services/auth.service.test.js

jest.mock("../../src/repositories/auth.repository");
jest.mock("../../src/repositories/expert.repository");
jest.mock("jsonwebtoken");

const authRepo = require("../../src/repositories/auth.repository");
const expertRepo = require("../../src/repositories/expert.repository");
const jwt = require("jsonwebtoken");

const authService = require("../../src/services/auth.service");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const makeMockUser = (overrides = {}) => ({
  id: 1,
  mobile: "9999999999",
  otp: "123456",
  otpExpiryAt: new Date(Date.now() + 5 * 60 * 1000), // valid: 5 min from now
  isVerified: false,
  role: null,
  hasProfile: false,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─────────────────────────────────────────────
// sendOtp
// ─────────────────────────────────────────────

describe("sendOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should create new user and return normalizedMobile + otp when user does not exist", async () => {
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue({ id: 1, mobile: "9999999999" });

    const result = await authService.sendOtp("9999999999");

    expect(authRepo.createUser).toHaveBeenCalledTimes(1);
    expect(authRepo.updateUser).not.toHaveBeenCalled();
    expect(result).toHaveProperty("otp");
    expect(result).toHaveProperty("normalizedMobile", "9999999999");
  });

  test("should update existing user otp when user already exists", async () => {
    const mockUser = makeMockUser();
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.updateUser.mockResolvedValue(mockUser);

    const result = await authService.sendOtp("9999999999");

    expect(authRepo.updateUser).toHaveBeenCalledTimes(1);
    expect(authRepo.createUser).not.toHaveBeenCalled();
    expect(result).toHaveProperty("otp");
    expect(result).toHaveProperty("normalizedMobile", "9999999999");
  });

  test("should generate a 6-digit OTP string", async () => {
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue({ id: 1 });

    const result = await authService.sendOtp("9999999999");

    expect(result.otp).toMatch(/^\d{6}$/);
  });

  test("should normalize mobile before using it", async () => {
    authRepo.normalizeMobile.mockReturnValue("8888888888");
    authRepo.findUserByMobile.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue({ id: 2 });

    const result = await authService.sendOtp("+918888888888");

    expect(authRepo.normalizeMobile).toHaveBeenCalledWith("+918888888888");
    expect(result.normalizedMobile).toBe("8888888888");
  });
});

// ─────────────────────────────────────────────
// verifyOtp
// ─────────────────────────────────────────────

describe("verifyOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should throw 'User not found' if user does not exist", async () => {
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(null);

    await expect(authService.verifyOtp("9999999999", "123456")).rejects.toThrow(
      "User not found"
    );
  });

  test("should throw 'Invalid OTP' if otp does not match", async () => {
    const mockUser = makeMockUser({ otp: "123456" });
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);

    await expect(authService.verifyOtp("9999999999", "000000")).rejects.toThrow(
      "Invalid OTP"
    );
  });

  test("should throw 'OTP expired' if otpExpiryAt is in the past", async () => {
    const mockUser = makeMockUser({
      otp: "123456",
      otpExpiryAt: new Date(Date.now() - 1000), // expired 1 sec ago
    });
    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);

    await expect(authService.verifyOtp("9999999999", "123456")).rejects.toThrow(
      "OTP expired"
    );
  });

  test("should return token and redirectTo /select-role when user has no role and no profile", async () => {
    const mockUser = makeMockUser({ otp: "123456", role: null, hasProfile: false });
    const freshUser = { ...mockUser, isVerified: true, otp: null, otpExpiryAt: null };

    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.findUserById.mockResolvedValue(freshUser);
    jwt.sign.mockReturnValue("mock_token");

    const result = await authService.verifyOtp("9999999999", "123456");

    expect(result.token).toBe("mock_token");
    expect(result.redirectTo).toBe("/select-role");
  });

  test("should redirect to /dashboard when user hasProfile is true", async () => {
    const mockUser = makeMockUser({ otp: "123456", hasProfile: true });
    const freshUser = { ...mockUser, hasProfile: true };

    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.findUserById.mockResolvedValue(freshUser);
    jwt.sign.mockReturnValue("mock_token");

    const result = await authService.verifyOtp("9999999999", "123456");

    expect(result.redirectTo).toBe("/dashboard");
  });

  test("should redirect to /jobseeker when role is jobseeker and no profile", async () => {
    const mockUser = makeMockUser({ otp: "123456", role: "jobseeker", hasProfile: false });
    const freshUser = { ...mockUser };

    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.findUserById.mockResolvedValue(freshUser);
    jwt.sign.mockReturnValue("mock_token");

    const result = await authService.verifyOtp("9999999999", "123456");

    expect(result.redirectTo).toBe("/jobseeker");
  });

  test("should redirect to /expert when role is expert and no profile", async () => {
    const mockUser = makeMockUser({ otp: "123456", role: "expert", hasProfile: false });
    const freshUser = { ...mockUser };

    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.findUserById.mockResolvedValue(freshUser);
    jwt.sign.mockReturnValue("mock_token");

    const result = await authService.verifyOtp("9999999999", "123456");

    expect(result.redirectTo).toBe("/expert");
  });

  test("should clear otp and mark user as verified on success", async () => {
    const mockUser = makeMockUser({ otp: "123456" });
    const freshUser = { ...mockUser };

    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.findUserById.mockResolvedValue(freshUser);
    jwt.sign.mockReturnValue("mock_token");

    await authService.verifyOtp("9999999999", "123456");

    expect(mockUser.otp).toBeNull();
    expect(mockUser.otpExpiryAt).toBeNull();
    expect(mockUser.isVerified).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
  });

  test("should return freshUser in result", async () => {
    const mockUser = makeMockUser({ otp: "123456" });
    const freshUser = { id: 1, mobile: "9999999999", isVerified: true };

    authRepo.normalizeMobile.mockReturnValue("9999999999");
    authRepo.findUserByMobile.mockResolvedValue(mockUser);
    authRepo.findUserById.mockResolvedValue(freshUser);
    jwt.sign.mockReturnValue("mock_token");

    const result = await authService.verifyOtp("9999999999", "123456");

    expect(result.freshUser).toEqual(freshUser);
  });
});

// ─────────────────────────────────────────────
// setRole
// ─────────────────────────────────────────────

describe("setRole", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should update user role and save when role is different", async () => {
    const mockUser = makeMockUser({ role: null });

    const result = await authService.setRole(mockUser, "jobseeker");

    expect(mockUser.role).toBe("jobseeker");
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(result.role).toBe("jobseeker");
  });

  test("should NOT call save when role is already set to the same value", async () => {
    const mockUser = makeMockUser({ role: "expert" });

    const result = await authService.setRole(mockUser, "expert");

    expect(mockUser.save).not.toHaveBeenCalled();
    expect(result.role).toBe("expert");
  });

  test("should return the user object", async () => {
    const mockUser = makeMockUser({ role: null });

    const result = await authService.setRole(mockUser, "jobseeker");

    expect(result).toBe(mockUser);
  });
});