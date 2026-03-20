// src/services/expert.service.js

const expertRepo = require("../repositories/expert.repository");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

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
// ✅ FIXED: Upload image/cv to Cloudinary if buffer exists
// ✅ FIXED: Falls back to existing URL if no new file uploaded
// ✅ FIXED: Handles all cases: new upload, existing URL, null
const createExpertProfile = async (
  userId,
  profileData,
  cvFile,
  imageFile,
  certificateFile,
) => {

  // ─── Upload image to Cloudinary if new file provided ───────────────────────
  let imageUrl = null;
  if (imageFile) {
    if (imageFile.buffer) {
      // ✅ New file uploaded via multer — upload to Cloudinary
      try {
        const result = await uploadToCloudinary(imageFile.buffer);
        imageUrl = result.secure_url;
        console.log("✅ Expert image uploaded to Cloudinary:", imageUrl);
      } catch (err) {
        console.error("❌ Expert image Cloudinary upload failed:", err.message);
      }
    } else if (imageFile.secure_url) {
      // ✅ Already a Cloudinary result object
      imageUrl = imageFile.secure_url;
    } else if (imageFile.path && imageFile.path.startsWith("http")) {
      // ✅ Already a URL (from some storage engines)
      imageUrl = imageFile.path;
    } else if (imageFile.filename && imageFile.filename.startsWith("http")) {
      // ✅ filename is actually a URL
      imageUrl = imageFile.filename;
    }
  }

  // ─── Upload CV to Cloudinary if new file provided ──────────────────────────
  let cvUrl = null;
  if (cvFile) {
    if (cvFile.buffer) {
      try {
        const result = await uploadToCloudinary(cvFile.buffer);
        cvUrl = result.secure_url;
        console.log("✅ Expert CV uploaded to Cloudinary:", cvUrl);
      } catch (err) {
        console.error("❌ Expert CV Cloudinary upload failed:", err.message);
      }
    } else if (cvFile.secure_url) {
      cvUrl = cvFile.secure_url;
    } else if (cvFile.path && cvFile.path.startsWith("http")) {
      cvUrl = cvFile.path;
    } else if (cvFile.filename && cvFile.filename.startsWith("http")) {
      cvUrl = cvFile.filename;
    }
  }

  // ─── Upload certificate to Cloudinary if new file provided ─────────────────
  let certUrl = null;
  if (certificateFile) {
    if (certificateFile.buffer) {
      try {
        const result = await uploadToCloudinary(certificateFile.buffer);
        certUrl = result.secure_url;
        console.log("✅ Expert certificate uploaded to Cloudinary:", certUrl);
      } catch (err) {
        console.error("❌ Expert certificate Cloudinary upload failed:", err.message);
      }
    } else if (certificateFile.secure_url) {
      certUrl = certificateFile.secure_url;
    } else if (certificateFile.path && certificateFile.path.startsWith("http")) {
      certUrl = certificateFile.path;
    }
  }

  // ─── Build data object ──────────────────────────────────────────────────────
  const data = {
    name:               profileData.fullName        || profileData.name        || null,
    email:              profileData.email            || null,
    bio:                profileData.bio              || null,
    experience:         profileData.experience       || null,
    domain:             profileData.domain           || null,
    sub_domain:         profileData.sub_domain       || null,
    certification:      profileData.certification    || profileData.certifications || null,
    location:           profileData.location         || null,
    language_spoken:    profileData.language_spoken  || profileData.languages    || null,
    qualification:      profileData.qualification    || null,
    certificate_domain: profileData.certificateDomain || null,
    is_online:          true,
    isVerified:         true,
    verificationStatus: "approved",
    userId,
  };

  // ✅ Only update image/cv/cert if a new one was uploaded
  // ✅ If null, keep existing value in DB (don't overwrite with null)
  if (imageUrl) data.image = imageUrl;
  if (cvUrl) data.cv = cvUrl;
  if (certUrl) data.certificate_file = certUrl;

  console.log("📝 createExpertProfile — data to save:", JSON.stringify(data));

  // ─── Save or update expert profile ─────────────────────────────────────────
  let profile = await expertRepo.findExpertProfileByUserId(userId);
  if (profile) {
    profile = await expertRepo.updateExpertProfile(profile, data);
  } else {
    profile = await expertRepo.createExpertProfile(data);
  }

  // ─── Save skills ────────────────────────────────────────────────────────────
  // ✅ Supports both array and comma-separated string
  const skillsRaw = profileData.skills || "";
  const skillsArray = Array.isArray(skillsRaw)
    ? skillsRaw
    : skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  if (skillsArray.length > 0 && profile?.id) {
    await expertRepo.deleteSkillsByExpertId(profile.id);
    const skillRows = skillsArray.map((skill_name) => ({
      expert_id: profile.id,
      skill_name,
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
   RATINGS
================================ */

const submitRating = async (expertId, userId, rating, comment) => {
  const { Review, Expert } = require("../models");

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

const getRatings = async (expertId) => {
  const { Review, User } = require("../models");

  const reviews = await Review.findAll({
    where: { expert_id: expertId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
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
