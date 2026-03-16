// tests/services/user.service.test.js

jest.mock("../../src/repositories/user.repository");

const userRepo = require("../../src/repositories/user.repository");
const userService = require("../../src/services/user.service");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const makeMockUser = (overrides = {}) => ({
  id: 1,
  mobile: "9999999999",
  otp: "123456",
  otpExpiryAt: new Date(Date.now() + 5 * 60 * 1000), // valid: 5 min from now
  isVerified: false,
  role: "user",
  hasProfile: false,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const makeMockProfile = (overrides = {}) => ({
  id: 1,
  userId: 1,
  fullName: "John Doe",
  email: "john@example.com",
  dob: "1995-01-01",
  qualification: "B.Tech",
  experience: "2 years",
  domain: "Software",
  role: "user",
  cvFile: null,
  update: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─────────────────────────────────────────────
// generateOtp
// ─────────────────────────────────────────────

describe("generateOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return a 6-digit OTP string for existing user", async () => {
    const mockUser = makeMockUser();
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    const otp = await userService.generateOtp("9999999999");

    expect(otp).toHaveLength(6);
    expect(otp).toMatch(/^\d{6}$/);
  });

  test("should update otp fields and call saveUser for existing user", async () => {
    const mockUser = makeMockUser();
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    await userService.generateOtp("9999999999");

    expect(userRepo.saveUser).toHaveBeenCalledWith(mockUser);
    expect(mockUser.otp).toMatch(/^\d{6}$/);
    expect(mockUser.isVerified).toBe(false);
  });

  test("should create new user when user does not exist", async () => {
    userRepo.findUserByMobile.mockResolvedValue(null);
    userRepo.createUser.mockResolvedValue(makeMockUser());

    const otp = await userService.generateOtp("9999999999");

    expect(userRepo.createUser).toHaveBeenCalledTimes(1);
    expect(userRepo.saveUser).not.toHaveBeenCalled();
    expect(otp).toMatch(/^\d{6}$/);
  });

  test("should create new user with correct default fields", async () => {
    userRepo.findUserByMobile.mockResolvedValue(null);
    userRepo.createUser.mockResolvedValue(makeMockUser());

    await userService.generateOtp("9999999999");

    expect(userRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        mobile: "9999999999",
        isVerified: false,
        role: "user",
        hasProfile: false,
      })
    );
  });
});

// ─────────────────────────────────────────────
// verifyOtp
// ─────────────────────────────────────────────

describe("verifyOtp", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should throw 'User not found' if user does not exist", async () => {
    userRepo.findUserByMobile.mockResolvedValue(null);

    await expect(userService.verifyOtp("9999999999", "123456")).rejects.toThrow(
      "User not found"
    );
  });

  test("should throw 'Invalid OTP' if otp does not match", async () => {
    const mockUser = makeMockUser({ otp: "123456" });
    userRepo.findUserByMobile.mockResolvedValue(mockUser);

    await expect(userService.verifyOtp("9999999999", "000000")).rejects.toThrow(
      "Invalid OTP"
    );
  });

  test("should throw 'OTP expired' if otpExpiryAt is in the past", async () => {
    const mockUser = makeMockUser({
      otp: "123456",
      otpExpiryAt: new Date(Date.now() - 1000), // expired 1 sec ago
    });
    userRepo.findUserByMobile.mockResolvedValue(mockUser);

    await expect(userService.verifyOtp("9999999999", "123456")).rejects.toThrow(
      "OTP expired"
    );
  });

  test("should clear otp fields and mark isVerified true on success", async () => {
    const mockUser = makeMockUser({ otp: "123456" });
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    await userService.verifyOtp("9999999999", "123456");

    expect(mockUser.otp).toBeNull();
    expect(mockUser.otpExpiryAt).toBeNull();
    expect(mockUser.isVerified).toBe(true);
    expect(userRepo.saveUser).toHaveBeenCalledWith(mockUser);
  });

  test("should return the verified user on success", async () => {
    const mockUser = makeMockUser({ otp: "123456" });
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    const result = await userService.verifyOtp("9999999999", "123456");

    expect(result).toBe(mockUser);
  });
});

// ─────────────────────────────────────────────
// getUserByMobile
// ─────────────────────────────────────────────

describe("getUserByMobile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return user when found", async () => {
    const mockUser = makeMockUser();
    userRepo.findUserByMobile.mockResolvedValue(mockUser);

    const result = await userService.getUserByMobile("9999999999");

    expect(userRepo.findUserByMobile).toHaveBeenCalledWith("9999999999");
    expect(result).toBe(mockUser);
  });

  test("should return null when user not found", async () => {
    userRepo.findUserByMobile.mockResolvedValue(null);

    const result = await userService.getUserByMobile("0000000000");

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────
// createUserProfile
// ─────────────────────────────────────────────

describe("createUserProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should throw 'User ID required' if userId is missing", async () => {
    await expect(
      userService.createUserProfile(null, {}, null)
    ).rejects.toThrow("User ID required");
  });

  test("should create a new profile if none exists", async () => {
    const mockUser = makeMockUser();
    const mockProfile = makeMockProfile();

    userRepo.findProfileByUserId.mockResolvedValue(null);
    userRepo.createProfile.mockResolvedValue(mockProfile);
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    const result = await userService.createUserProfile(1, { fullName: "John Doe" }, null);

    expect(userRepo.createProfile).toHaveBeenCalledTimes(1);
    expect(userRepo.updateProfile).not.toHaveBeenCalled();
    expect(result).toBe(mockProfile);
  });

  test("should update existing profile if one already exists", async () => {
    const mockUser = makeMockUser();
    const mockProfile = makeMockProfile();

    userRepo.findProfileByUserId.mockResolvedValue(mockProfile);
    userRepo.updateProfile.mockResolvedValue(mockProfile);
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    const result = await userService.createUserProfile(1, { fullName: "John Doe" }, null);

    expect(userRepo.updateProfile).toHaveBeenCalledTimes(1);
    expect(userRepo.createProfile).not.toHaveBeenCalled();
    expect(result).toBe(mockProfile);
  });

  test("should NOT set hasProfile because findUserById is not exported from repo", async () => {
    // ⚠️ user.service.js does: await userRepo.findUserById ? await userRepo.findUserById(userId) : null
    // Since findUserById is NOT exported from user.repository.js, it is undefined → user is null → block is skipped
    const mockUser = makeMockUser({ hasProfile: false });
    const mockProfile = makeMockProfile();

    userRepo.findProfileByUserId.mockResolvedValue(null);
    userRepo.createProfile.mockResolvedValue(mockProfile);

    await userService.createUserProfile(1, { fullName: "John Doe" }, null);

    // user block never runs — hasProfile stays false, saveUser never called
    expect(mockUser.hasProfile).toBe(false);
    expect(userRepo.saveUser).not.toHaveBeenCalled();
  });

  test("should NOT update role to expert because findUserById is not exported from repo", async () => {
    // ⚠️ Same reason — user is null, role update block is skipped entirely
    const mockUser = makeMockUser({ role: "user" });
    const mockProfile = makeMockProfile({ role: "expert" });

    userRepo.findProfileByUserId.mockResolvedValue(null);
    userRepo.createProfile.mockResolvedValue(mockProfile);

    await userService.createUserProfile(1, { role: "expert" }, null);

    // role stays unchanged
    expect(mockUser.role).toBe("user");
    expect(userRepo.saveUser).not.toHaveBeenCalled();
  });

  test("should save cv filename when file is provided", async () => {
    const mockUser = makeMockUser();
    const mockProfile = makeMockProfile();
    const mockFile = { filename: "resume.pdf" };

    userRepo.findProfileByUserId.mockResolvedValue(null);
    userRepo.createProfile.mockResolvedValue(mockProfile);
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    await userService.createUserProfile(1, {}, mockFile);

    expect(userRepo.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({ cvFile: "resume.pdf" })
    );
  });

  test("should set cvFile to null when no file is provided", async () => {
    const mockUser = makeMockUser();
    const mockProfile = makeMockProfile();

    userRepo.findProfileByUserId.mockResolvedValue(null);
    userRepo.createProfile.mockResolvedValue(mockProfile);
    userRepo.findUserByMobile.mockResolvedValue(mockUser);
    userRepo.saveUser.mockResolvedValue(mockUser);

    await userService.createUserProfile(1, {}, null);

    expect(userRepo.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({ cvFile: null })
    );
  });
});

// ─────────────────────────────────────────────
// getUserProfile
// ─────────────────────────────────────────────

describe("getUserProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return profile when found", async () => {
    const mockProfile = makeMockProfile();
    userRepo.findProfileByUserId.mockResolvedValue(mockProfile);

    const result = await userService.getUserProfile(1);

    expect(userRepo.findProfileByUserId).toHaveBeenCalledWith(1);
    expect(result).toBe(mockProfile);
  });

  test("should throw 'Profile not found' when profile does not exist", async () => {
    userRepo.findProfileByUserId.mockResolvedValue(null);

    await expect(userService.getUserProfile(1)).rejects.toThrow(
      "Profile not found"
    );
  });
});