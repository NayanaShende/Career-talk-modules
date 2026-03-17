// src/services/expert.service.js

const expertRepo = require("../repositories/expert.repository");

/* ===============================
   BASIC CRUD
================================ */

const getAllExperts = async () => {
  return await expertRepo.findAllExperts();
};

const createExpert = async (data) => {
  const existing = await expertRepo.findExpertByUserId(data.userId);
  if (existing) {
    throw new Error("Expert profile already exists for this user");
  }
  return await expertRepo.createExpert(data);
};

const updateExpert = async (id, data) => {
  await expertRepo.updateExpertById(id, data);
  return await expertRepo.findExpertById(id);
};

/* ===============================
   SKILLS
================================ */

const addSkills = async (expertId, skills) => {
  if (!skills || !skills.length) return [];

  const skillRows = skills.map((skill) => ({
    expert_id: expertId,
    skill_name: skill,
  }));

  return await expertRepo.bulkCreateSkills(skillRows);
};

/* ===============================
   LISTING
================================ */

const getRecommendedExperts = async (limit = 10) => {
  return await expertRepo.findRecommendedExperts(limit);
};

const getOnlineExperts = async (limit = 10) => {
  return await expertRepo.findOnlineExperts(limit);
};

/* ===============================
   SEARCH
================================ */

const searchExperts = async (domain) => {
  return await expertRepo.searchExpertsBySkill(domain);
};

const searchExpertsByHeadline = async (domain) => {
  return await expertRepo.searchExpertsByHeadline(domain);
};

const getExpertsBySkill = async (skill) => {
  if (!skill || skill === "All") return await expertRepo.findAllExperts();
  return await expertRepo.findExpertsBySkillName(skill);
};

/* ===============================
   EXPERT PROFILE
================================ */

// ✅ FIXED: now accepts imageFile and certificateFile separately
// ✅ FIXED: saves image filename to DB so dashboard can show it
// ✅ FIXED: sets is_online = true immediately after profile creation
// ✅ FIXED: saves skills from comma-separated string OR array in profileData.skills
// ✅ FIXED: map both "certification" AND "certifications" so either works
// ✅ FIXED: language_spoken now also checks profileData.languages
// ✅ FIXED: gender now saved to Experts table
const createExpertProfile = async (
  userId,
  profileData,
  cvFile,
  imageFile,
  certificateFile,
) => {
  const data = {
    name: profileData.fullName || profileData.name || null,
    email: profileData.email || null,
    bio: profileData.bio || null,
    experience: profileData.experience || null,
    domain: profileData.domain || null,
    certification:
      profileData.certification || profileData.certifications || null,
    location: profileData.location || null,
    language_spoken:
      profileData.language_spoken || profileData.languages || null,
    qualification: profileData.qualification || null,
    cv: cvFile ? cvFile.filename : null,
    image: imageFile ? imageFile.filename : null,
    certificate_file: certificateFile ? certificateFile.filename : null,
    certificate_domain: profileData.certificateDomain || null,
    is_online: true,
    isVerified: true,
    verificationStatus: "approved",
    // ✅ FIXED: gender added — was missing, causing null in Experts table
    gender: profileData.gender || null,
    userId,
  };

  console.log("📝 createExpertProfile — data to save:", JSON.stringify(data));
  console.log("👤 Gender being saved to Experts table:", data.gender); // ✅ debug log

  let profile = await expertRepo.findExpertProfileByUserId(userId);
  if (profile) {
    profile = await expertRepo.updateExpertProfile(profile, data);
  } else {
    profile = await expertRepo.createExpertProfile(data);
  }

  // ✅ Save skills — supports both array and comma-separated string
  const skillsRaw = profileData.skills || "";
  const skillsArray = Array.isArray(skillsRaw)
    ? skillsRaw
    : skillsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  if (skillsArray.length > 0 && profile?.id) {
    await expertRepo.deleteSkillsByExpertId(profile.id);
    const skillRows = skillsArray.map((skill) => ({
      expert_id: profile.id,
      skill_name: skill,
    }));
    await expertRepo.bulkCreateSkills(skillRows);
  }

  return profile;
};

const getExpertProfile = async (userId) => {
  return await expertRepo.findExpertProfileByUserId(userId);
};

const getExpertById = async (id) => {
  return await expertRepo.findExpertById(id);
};

/* ===============================
   RATINGS ✅ FIXED
================================ */

const submitRating = async (expertId, userId, rating, comment) => {
  const { Review, Expert } = require("../models");

  // ✅ Check if this user already rated this expert
  const existing = await Review.findOne({
    where: { expert_id: expertId, userId },
  });

  if (existing) {
    throw new Error("ALREADY_RATED");
  }

  await Review.create({ expert_id: expertId, userId, rating, comment });

  const allReviews = await Review.findAll({ where: { expert_id: expertId } });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await Expert.update(
    { rating: parseFloat(avgRating.toFixed(1)) },
    { where: { id: expertId } },
  );

  return {
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalReviews: allReviews.length,
  };
};

// ✅ FIXED: Users table uses "fullName" not "name", and "image" from later migration
const getRatings = async (expertId) => {
  const { Review, User } = require("../models");

  const reviews = await Review.findAll({
    where: { expert_id: expertId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        // ✅ FIXED: "fullName" instead of "name" — matches Users table migration
        // ✅ FIXED: "image" is safe — added in later migration (20260302071602)
        attributes: ["id", "fullName", "image"],
      },
    ],
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const mappedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    userId: r.user?.id || r.userId,
    // ✅ FIXED: fullName not name
    userName: r.user?.fullName || "Anonymous",
    userImage: r.user?.image || null,
  }));

  return {
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalReviews: reviews.length,
    reviews: mappedReviews,
  };
};

module.exports = {
  getAllExperts,
  createExpert,
  updateExpert,
  addSkills,
  getRecommendedExperts,
  getOnlineExperts,
  searchExperts,
  searchExpertsByHeadline,
  getExpertsBySkill,
  createExpertProfile,
  getExpertProfile,
  getExpertById,
  submitRating,
  getRatings,
};
