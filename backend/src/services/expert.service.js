// src/services/expert.service.js

const expertRepo = require("../repositories/expert.repository");

const getAllExperts = async () => {
  return await expertRepo.findAllExperts();
};

const createExpert = async (data) => {
  return await expertRepo.createExpert(data);
};

const updateExpert = async (id, data) => {
  await expertRepo.updateExpertById(id, data);
  return await expertRepo.findExpertById(id);
};

const addSkills = async (expertId, skills) => {
  const skillRows = skills.map((skill) => ({
    expert_id: expertId,
    skill_name: skill,
  }));
  return await expertRepo.bulkCreateSkills(skillRows);
};

const getRecommendedExperts = async (limit = 10) => {
  return await expertRepo.findRecommendedExperts(limit);
};

const getOnlineExperts = async (limit = 10) => {
  return await expertRepo.findOnlineExperts(limit);
};

const searchExperts = async (skill) => {
  return await expertRepo.searchExpertsBySkill(skill);
};

const searchExpertsByHeadline = async (skill) => {
  return await expertRepo.searchExpertsByHeadline(skill);
};

// ✅ NEW: Get experts filtered by skill column
const getExpertsBySkill = async (skill) => {
  return await expertRepo.findExpertsBySkill(skill);
};

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

module.exports = {
  getAllExperts,
  createExpert,
  updateExpert,
  addSkills,
  getRecommendedExperts,
  getOnlineExperts,
  searchExperts,
  searchExpertsByHeadline,
  getExpertsBySkill, // ✅ NEW
  createExpertProfile,
  getExpertProfile,
};