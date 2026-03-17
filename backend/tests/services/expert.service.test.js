// tests/services/expert.service.test.js

jest.mock("../../src/repositories/expert.repository");

// ✅ Mock models used directly inside submitRating & getRatings
jest.mock("../../src/models", () => ({
  Review: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Expert: {
    update: jest.fn(),
  },
}));

const expertRepo = require("../../src/repositories/expert.repository");
const { Review, Expert } = require("../../src/models");
const expertService = require("../../src/services/expert.service");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const makeMockExpert = (overrides = {}) => ({
  id: 1,
  userId: 10,
  name: "Jane Expert",
  email: "jane@example.com",
  bio: "Top expert",
  experience: "5 years",
  domain: "Finance",
  certification: "CFA",
  location: "Mumbai",
  language_spoken: "English",
  cv: null,
  rating: 4.5,
  is_online: true,
  update: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const makeMockProfile = (overrides = {}) => ({
  id: 1,
  userId: 10,
  name: "Jane Expert",
  update: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─────────────────────────────────────────────
// getAllExperts
// ─────────────────────────────────────────────

describe("getAllExperts", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return all experts", async () => {
    expertRepo.findAllExperts.mockResolvedValue([makeMockExpert(), makeMockExpert({ id: 2 })]);

    const result = await expertService.getAllExperts();

    expect(expertRepo.findAllExperts).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
  });

  test("should return empty array when no experts exist", async () => {
    expertRepo.findAllExperts.mockResolvedValue([]);

    const result = await expertService.getAllExperts();

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// createExpert
// ─────────────────────────────────────────────

describe("createExpert", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should create expert when no existing profile found", async () => {
    const mockExpert = makeMockExpert();
    expertRepo.findExpertByUserId.mockResolvedValue(null);
    expertRepo.createExpert.mockResolvedValue(mockExpert);

    const result = await expertService.createExpert({ userId: 10, name: "Jane" });

    expect(expertRepo.createExpert).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockExpert);
  });

  test("should throw error if expert profile already exists for user", async () => {
    expertRepo.findExpertByUserId.mockResolvedValue(makeMockExpert());

    await expect(
      expertService.createExpert({ userId: 10 })
    ).rejects.toThrow("Expert profile already exists for this user");

    expect(expertRepo.createExpert).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// updateExpert
// ─────────────────────────────────────────────

describe("updateExpert", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should update expert and return updated record", async () => {
    const updatedExpert = makeMockExpert({ name: "Updated Name" });
    expertRepo.updateExpertById.mockResolvedValue(true);
    expertRepo.findExpertById.mockResolvedValue(updatedExpert);

    const result = await expertService.updateExpert(1, { name: "Updated Name" });

    expect(expertRepo.updateExpertById).toHaveBeenCalledWith(1, { name: "Updated Name" });
    expect(expertRepo.findExpertById).toHaveBeenCalledWith(1);
    expect(result.name).toBe("Updated Name");
  });
});

// ─────────────────────────────────────────────
// addSkills
// ─────────────────────────────────────────────

describe("addSkills", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should bulk create skills for expert", async () => {
    const skillRows = [
      { expert_id: 1, skill_name: "React" },
      { expert_id: 1, skill_name: "Node.js" },
    ];
    expertRepo.bulkCreateSkills.mockResolvedValue(skillRows);

    const result = await expertService.addSkills(1, ["React", "Node.js"]);

    expect(expertRepo.bulkCreateSkills).toHaveBeenCalledWith(skillRows);
    expect(result).toHaveLength(2);
  });

  test("should return empty array when skills list is empty", async () => {
    const result = await expertService.addSkills(1, []);

    expect(expertRepo.bulkCreateSkills).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("should return empty array when skills is null", async () => {
    const result = await expertService.addSkills(1, null);

    expect(expertRepo.bulkCreateSkills).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// getRecommendedExperts
// ─────────────────────────────────────────────

describe("getRecommendedExperts", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return recommended experts with default limit 10", async () => {
    expertRepo.findRecommendedExperts.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.getRecommendedExperts();

    expect(expertRepo.findRecommendedExperts).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
  });

  test("should pass custom limit to repo", async () => {
    expertRepo.findRecommendedExperts.mockResolvedValue([]);

    await expertService.getRecommendedExperts(5);

    expect(expertRepo.findRecommendedExperts).toHaveBeenCalledWith(5);
  });
});

// ─────────────────────────────────────────────
// getOnlineExperts
// ─────────────────────────────────────────────

describe("getOnlineExperts", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return online experts with default limit 10", async () => {
    expertRepo.findOnlineExperts.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.getOnlineExperts();

    expect(expertRepo.findOnlineExperts).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(1);
  });

  test("should pass custom limit to repo", async () => {
    expertRepo.findOnlineExperts.mockResolvedValue([]);

    await expertService.getOnlineExperts(3);

    expect(expertRepo.findOnlineExperts).toHaveBeenCalledWith(3);
  });
});

// ─────────────────────────────────────────────
// searchExperts
// ─────────────────────────────────────────────

describe("searchExperts", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return experts matching domain", async () => {
    expertRepo.searchExpertsBySkill.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.searchExperts("Finance");

    expect(expertRepo.searchExpertsBySkill).toHaveBeenCalledWith("Finance");
    expect(result).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// searchExpertsByHeadline
// ─────────────────────────────────────────────

describe("searchExpertsByHeadline", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return experts matching headline/domain", async () => {
    expertRepo.searchExpertsByHeadline.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.searchExpertsByHeadline("Finance");

    expect(expertRepo.searchExpertsByHeadline).toHaveBeenCalledWith("Finance");
    expect(result).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// getExpertsBySkill
// ─────────────────────────────────────────────

describe("getExpertsBySkill", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return all experts when skill is 'All'", async () => {
    expertRepo.findAllExperts.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.getExpertsBySkill("All");

    expect(expertRepo.findAllExperts).toHaveBeenCalledTimes(1);
    expect(expertRepo.findExpertsBySkillName).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  test("should return all experts when skill is null/empty", async () => {
    expertRepo.findAllExperts.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.getExpertsBySkill(null);

    expect(expertRepo.findAllExperts).toHaveBeenCalledTimes(1);
    expect(expertRepo.findExpertsBySkillName).not.toHaveBeenCalled();
  });

  test("should filter by skill name when specific skill is given", async () => {
    expertRepo.findExpertsBySkillName.mockResolvedValue([makeMockExpert()]);

    const result = await expertService.getExpertsBySkill("React");

    expect(expertRepo.findExpertsBySkillName).toHaveBeenCalledWith("React");
    expect(expertRepo.findAllExperts).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// createExpertProfile
// ─────────────────────────────────────────────

describe("createExpertProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should create new expert profile when none exists", async () => {
    const mockProfile = makeMockProfile();
    expertRepo.findExpertProfileByUserId.mockResolvedValue(null);
    expertRepo.createExpertProfile.mockResolvedValue(mockProfile);

    const result = await expertService.createExpertProfile(10, { fullName: "Jane" }, null);

    expect(expertRepo.createExpertProfile).toHaveBeenCalledTimes(1);
    expect(expertRepo.updateExpertProfile).not.toHaveBeenCalled();
    expect(result).toBe(mockProfile);
  });

  test("should update existing expert profile when one exists", async () => {
    const mockProfile = makeMockProfile();
    expertRepo.findExpertProfileByUserId.mockResolvedValue(mockProfile);
    expertRepo.updateExpertProfile.mockResolvedValue(mockProfile);

    const result = await expertService.createExpertProfile(10, { fullName: "Jane" }, null);

    expect(expertRepo.updateExpertProfile).toHaveBeenCalledTimes(1);
    expect(expertRepo.createExpertProfile).not.toHaveBeenCalled();
    expect(result).toBe(mockProfile);
  });

  test("should map profileData fields correctly to Expert table columns", async () => {
    expertRepo.findExpertProfileByUserId.mockResolvedValue(null);
    expertRepo.createExpertProfile.mockResolvedValue(makeMockProfile());

    await expertService.createExpertProfile(10, {
      fullName: "Jane",
      email: "jane@example.com",
      bio: "Top expert",
      experience: "5 years",
      domain: "Finance",
      certifications: "CFA",
      location: "Mumbai",
      language_spoken: "English",
    }, null);

    expect(expertRepo.createExpertProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane",
        email: "jane@example.com",
        bio: "Top expert",
        experience: "5 years",
        domain: "Finance",
        certification: "CFA",
        location: "Mumbai",
        language_spoken: "English",
        cv: null,
        userId: 10,
      })
    );
  });

  test("should save cv filename when file is provided", async () => {
    expertRepo.findExpertProfileByUserId.mockResolvedValue(null);
    expertRepo.createExpertProfile.mockResolvedValue(makeMockProfile());

    await expertService.createExpertProfile(10, {}, { filename: "cv.pdf" });

    expect(expertRepo.createExpertProfile).toHaveBeenCalledWith(
      expect.objectContaining({ cv: "cv.pdf" })
    );
  });

  test("should set cv to null when no file provided", async () => {
    expertRepo.findExpertProfileByUserId.mockResolvedValue(null);
    expertRepo.createExpertProfile.mockResolvedValue(makeMockProfile());

    await expertService.createExpertProfile(10, {}, null);

    expect(expertRepo.createExpertProfile).toHaveBeenCalledWith(
      expect.objectContaining({ cv: null })
    );
  });
});

// ─────────────────────────────────────────────
// getExpertProfile
// ─────────────────────────────────────────────

describe("getExpertProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return profile when found", async () => {
    const mockProfile = makeMockProfile();
    expertRepo.findExpertProfileByUserId.mockResolvedValue(mockProfile);

    const result = await expertService.getExpertProfile(10);

    expect(expertRepo.findExpertProfileByUserId).toHaveBeenCalledWith(10);
    expect(result).toBe(mockProfile);
  });

  test("should return null when profile does not exist", async () => {
    expertRepo.findExpertProfileByUserId.mockResolvedValue(null);

    const result = await expertService.getExpertProfile(10);

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────
// getExpertById
// ─────────────────────────────────────────────

describe("getExpertById", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return expert by id", async () => {
    const mockExpert = makeMockExpert();
    expertRepo.findExpertById.mockResolvedValue(mockExpert);

    const result = await expertService.getExpertById(1);

    expect(expertRepo.findExpertById).toHaveBeenCalledWith(1);
    expect(result).toBe(mockExpert);
  });

  test("should return null when expert not found", async () => {
    expertRepo.findExpertById.mockResolvedValue(null);

    const result = await expertService.getExpertById(999);

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────
// submitRating
// ─────────────────────────────────────────────

describe("submitRating", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should create review and return correct avgRating and totalReviews", async () => {
    Review.create.mockResolvedValue(true);
    Review.findAll.mockResolvedValue([
      { rating: 4 },
      { rating: 5 },
    ]);
    Expert.update.mockResolvedValue(true);

    const result = await expertService.submitRating(1, 5);

    expect(Review.create).toHaveBeenCalledWith({ expert_id: 1, rating: 5 });
    expect(Expert.update).toHaveBeenCalledWith(
      { rating: 4.5 },
      { where: { id: 1 } }
    );
    expect(result.avgRating).toBe(4.5);
    expect(result.totalReviews).toBe(2);
  });

  test("should return avgRating rounded to 1 decimal place", async () => {
    Review.create.mockResolvedValue(true);
    Review.findAll.mockResolvedValue([
      { rating: 4 },
      { rating: 4 },
      { rating: 5 },
    ]);
    Expert.update.mockResolvedValue(true);

    const result = await expertService.submitRating(1, 5);

    expect(result.avgRating).toBe(4.3);
  });
});

// ─────────────────────────────────────────────
// getRatings
// ─────────────────────────────────────────────

describe("getRatings", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return avgRating, totalReviews and reviews list", async () => {
    const mockReviews = [{ rating: 4 }, { rating: 5 }];
    Review.findAll.mockResolvedValue(mockReviews);

    const result = await expertService.getRatings(1);

    expect(result.avgRating).toBe(4.5);
    expect(result.totalReviews).toBe(2);
    expect(result.reviews).toEqual(mockReviews);
  });

  test("should return avgRating 0 when no reviews exist", async () => {
    Review.findAll.mockResolvedValue([]);

    const result = await expertService.getRatings(1);

    expect(result.avgRating).toBe(0);
    expect(result.totalReviews).toBe(0);
    expect(result.reviews).toEqual([]);
  });
});