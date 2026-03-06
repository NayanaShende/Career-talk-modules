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

// ✅ FIXED: filter by ExpertSkills table not domain column
const getExpertsBySkill = async (skill) => {
  if (!skill || skill === "All") return await expertRepo.findAllExperts();
  return await expertRepo.findExpertsBySkillName(skill);
};

/* ===============================
   EXPERT PROFILE
================================ */

const createExpertProfile = async (userId, profileData, file) => {
  // ✅ FIXED: field names now match Experts table columns (not Users table)
  const data = {
    name:            profileData.fullName        || null,  // ✅ Expert.name
    email:           profileData.email           || null,  // ✅ via User, kept for reference
    bio:             profileData.bio             || null,  // ✅ Expert.bio
    experience:      profileData.experience      || null,  // ✅ Expert.experience
    domain:          profileData.domain          || null,  // ✅ Expert.domain
    certification:   profileData.certifications  || null,  // ✅ Expert.certification
    location:        profileData.location        || null,  // ✅ Expert.location
    language_spoken: profileData.language_spoken || null,  // ✅ Expert.language_spoken
    cv:              file ? file.filename         : null,  // ✅ Expert.cv (was cvFile)
    userId,                                                // ✅ FK link to Users table
  };

  let profile = await expertRepo.findExpertProfileByUserId(userId);
  if (profile) {
    profile = await expertRepo.updateExpertProfile(profile, data);
  } else {
    profile = await expertRepo.createExpertProfile(data);
  }
  return profile;
};

// ✅ FIXED: return null instead of throwing — lets frontend handle empty profile gracefully
const getExpertProfile = async (userId) => {
  const profile = await expertRepo.findExpertProfileByUserId(userId);
  if (!profile) return null; // ✅ no longer throws "Profile not found"
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

  // ✅ FIXED: only save fields that exist in DB (no comment, no user_id)
  await Review.create({
    expert_id: expertId,
    rating,
  });

  const reviews = await Review.findAll({ where: { expert_id: expertId } });
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Expert.update(
    { rating: parseFloat(avgRating.toFixed(1)) },
    { where: { id: expertId } }
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