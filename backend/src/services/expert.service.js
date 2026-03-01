// src/services/expert.service.js

const expertRepo = require("../repositories/expert.repository");

/* ===============================
   BASIC CRUD
================================ */

const getAllExperts = async () => {
  return await expertRepo.findAllExperts();
};

const createExpert = async (data) => {
  // ✅ Prevent duplicate expert profile
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
   DOMAIN SEARCH (UPDATED)
================================ */

// 🔥 Now using domain instead of skill
const searchExperts = async (domain) => {
  return await expertRepo.searchExpertsBySkill(domain);
};

const searchExpertsByHeadline = async (domain) => {
  return await expertRepo.searchExpertsByHeadline(domain);
};

// ✅ Filter experts by domain
const getExpertsBySkill = async (domain) => {
  return await expertRepo.findExpertsBySkill(domain);
};

/* ===============================
   EXPERT PROFILE (SEPARATE TABLE)
================================ */

const createExpertProfile = async (userId, profileData, file) => {
  const data = {
    fullName: profileData.fullName || null,
    email: profileData.email || null,
    dob: profileData.dob || null,
    qualification: profileData.qualification || null,
    experience: profileData.experience || null,
    domain: profileData.domain || null,
    certifications: profileData.certifications || null,
    linkedIn: profileData.linkedIn || null,
    cvFile: file ? file.filename : null,
    userId,
  };

  let profile = await expertRepo.findExpertProfileByUserId(userId);

  if (profile) {
    profile = await expertRepo.updateExpertProfile(profile, data);
  } else {
    profile = await expertRepo.createExpertProfile(data);
  }

  return profile;
};

const getExpertProfile = async (userId) => {
  const profile = await expertRepo.findExpertProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return profile;
};

const getExpertById = async (id) => {
  return await expertRepo.findExpertById(id);
};

/* ===============================
   RATINGS ✅ NEW
================================ */

const submitRating = async (expertId, rating, comment, userId) => {
  const { Review, Expert } = require("../models");

  // 1. Save the review
  await Review.create({
    expert_id: expertId,
    rating,
    comment: comment || null,
    user_id: userId,
  });

  // 2. Recalculate average rating for the expert
  const reviews = await Review.findAll({ where: { expert_id: expertId } });
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // 3. Update expert's rating
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
  submitRating, // ✅ NEW
  getRatings,   // ✅ NEW
};