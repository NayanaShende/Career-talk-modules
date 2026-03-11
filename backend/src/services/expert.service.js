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
// ✅ FIXED: saves skills from comma-separated string in profileData.skills
// ✅ FIXED: map both "certification" AND "certifications" so either works
// ✅ FIXED: language_spoken now also checks profileData.languages
const createExpertProfile = async (
  userId,
  profileData,
  cvFile,
  imageFile,
  certificateFile,
) => {
  // ✅ Parse skills from comma-separated string e.g. "React,Node.js,Python"
  let skillsArray = [];
  if (profileData.skills) {
    skillsArray = profileData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const data = {
    name:               profileData.fullName        || profileData.name        || null,  // ✅ Expert.name
    email:              profileData.email            || null,                             // ✅ via User, kept for reference
    bio:                profileData.bio              || null,                             // ✅ Expert.bio
    experience:         profileData.experience       || null,                             // ✅ Expert.experience
    domain:             profileData.domain           || null,                             // ✅ Expert.domain
    // ✅ FIXED: checks both "certification" and "certifications"
    certification:      profileData.certification    || profileData.certifications || null,  // ✅ Expert.certification
    location:           profileData.location         || null,                             // ✅ Expert.location
    // ✅ FIXED: checks both "language_spoken" and "languages"
    language_spoken:    profileData.language_spoken  || profileData.languages    || null, // ✅ Expert.language_spoken
    qualification:      profileData.qualification    || null,                             // ✅ Expert.qualification
    // ✅ FIXED: save actual filenames from multer — these were all null before
    cv:                 cvFile        ? cvFile.filename        : null,                    // ✅ Expert.cv
    image:              imageFile     ? imageFile.filename     : null,                    // ✅ Expert.image
    certificate_file:   certificateFile ? certificateFile.filename : null,               // ✅ Expert.certificate_file
    certificate_domain: profileData.certificateDomain || null,                           // ✅ Expert.certificate_domain
    // ✅ FIXED: set is_online = true so expert appears in Live Experts immediately
    is_online:          true,
    isVerified:         true,
    verificationStatus: "approved",
    userId,                                                                               // ✅ FK link to Users table
  };

  console.log("📝 createExpertProfile — data to save:", JSON.stringify(data));

  let profile = await expertRepo.findExpertProfileByUserId(userId);
  if (profile) {
    profile = await expertRepo.updateExpertProfile(profile, data);
  } else {
    profile = await expertRepo.createExpertProfile(data);
  }

  // ✅ Save skills to ExpertSkills table if provided
  if (skillsArray.length > 0 && profile?.id) {
    // Delete old skills first to avoid duplicates on update
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
  const profile = await expertRepo.findExpertProfileByUserId(userId);
  if (!profile) return null;
  return profile;
};

const getExpertById = async (id) => {
  return await expertRepo.findExpertById(id);
};

/* ===============================
   RATINGS
================================ */

const submitRating = async (expertId, rating) => {
  const { Review, Expert } = require("../models");

  await Review.create({ expert_id: expertId, rating });

  const reviews = await Review.findAll({ where: { expert_id: expertId } });
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Expert.update(
    { rating: parseFloat(avgRating.toFixed(1)) },
    { where: { id: expertId } },
  );

  return {
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalReviews: reviews.length,
  };
};

const getRatings = async (expertId) => {
  const { Review } = require("../models");

  const reviews = await Review.findAll({
    where: { expert_id: expertId },
    order: [["createdAt", "DESC"]],
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalReviews: reviews.length,
    reviews,
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