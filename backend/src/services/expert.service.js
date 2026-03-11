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

const createExpertProfile = async (userId, profileData, file) => {
  const data = {
    name: profileData.fullName || profileData.name || null,
    email: profileData.email || null,
    bio: profileData.bio || null,
    experience: profileData.experience || null,
    domain: profileData.domain || null,
    certification:
      profileData.certification || profileData.certifications || null,
    location: profileData.location || null,
    language_spoken: profileData.language_spoken || null,
    cv: file ? file.filename : null,
    userId,
  };

  console.log("📝 createExpertProfile — data to save:", JSON.stringify(data));

  let profile = await expertRepo.findExpertProfileByUserId(userId);
  if (profile) {
    profile = await expertRepo.updateExpertProfile(profile, data);
  } else {
    profile = await expertRepo.createExpertProfile(data);
  }

  // Save skills to ExpertSkills table if provided
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

// ✅ submitRating — saves userId + comment, enforces one rating per user per expert
const submitRating = async (expertId, userId, rating, comment) => {
  const { Review, Expert, User } = require("../models");

  // ✅ Check if this user already rated this expert
  const existing = await Review.findOne({
    where: {
      expert_id: expertId,
      userId: userId, // make sure your Review model has userId column
    },
  });

  if (existing) {
    throw new Error("ALREADY_RATED"); // ✅ controller catches this and returns 409
  }

  // ✅ Create review with userId + comment + rating
  await Review.create({
    expert_id: expertId,
    userId,
    rating,
    comment, // ✅ make sure your Review model has comment column
  });

  // ✅ Recalculate average rating for this expert
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

// ✅ getRatings — returns reviews WITH user name + image so frontend can display them
const getRatings = async (expertId) => {
  const { Review, User } = require("../models");

  const reviews = await Review.findAll({
    where: { expert_id: expertId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user", // ✅ make sure Review.belongsTo(User) is set in your model
        attributes: ["id", "name", "image"], // ✅ only pull what we need
      },
    ],
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ✅ Map reviews to include flat userId, userName, userImage for frontend
  const mappedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    userId: r.user?.id || r.userId, // ✅ used by frontend to detect "your" review
    userName: r.user?.name || "Anonymous",
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
