// src/repositories/expert.repository.js

const { Expert, ExpertSkill, ExpertProfile } = require("../models");
const { Op } = require("sequelize");

const findAllExperts = async () => {
  return await Expert.findAll({
    include: { model: ExpertSkill, as: "skills" },
  });
};

const createExpert = async (data) => {
  return await Expert.create(data);
};

const updateExpertById = async (id, data) => {
  return await Expert.update(data, { where: { id } });
};

const findExpertById = async (id) => {
  return await Expert.findOne({
    where: { id },
    include: { model: ExpertSkill, as: "skills" },
  });
};

const findRecommendedExperts = async (limit) => {
  return await Expert.findAll({
    order: [["createdAt", "DESC"]],
    limit,
  });
};

const findOnlineExperts = async (limit) => {
  return await Expert.findAll({
    where: { is_online: true },
    include: { model: ExpertSkill, as: "skills" },
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });
};

const bulkCreateSkills = async (skillRows) => {
  return await ExpertSkill.bulkCreate(skillRows);
};

// ✅ SIMPLE FIX: filter by skill column only (exact match, case-insensitive)
const searchExpertsByHeadline = async (skill) => {
  try {
    console.log("🔍 Filtering by skill column:", skill);

    const result = await Expert.findAll({
      where: {
        skill: { [Op.iLike]: `%${skill}%` }, // ✅ only skill column
      },
      include: { model: ExpertSkill, as: "skills" },
      order: [
        ["rating", "DESC"],
        ["experience", "DESC"],
      ],
    });

    console.log("✅ Found:", result.length, "experts for skill:", skill);
    return result;
  } catch (err) {
    console.error("❌ searchExpertsByHeadline error:", err.message);
    throw err;
  }
};

const searchExpertsBySkill = async (skill) => {
  if (!skill) return await Expert.findAll();
  return await Expert.findAll({
    where: {
      skill: { [Op.iLike]: `%${skill}%` },
    },
    include: { model: ExpertSkill, as: "skills" },
  });
};

const findExpertsBySkill = async (skill) => {
  try {
    console.log("🔍 Searching skill:", skill);
    const result = await Expert.findAll({
      where: { skill: { [Op.iLike]: `%${skill}%` } },
      include: { model: ExpertSkill, as: "skills" },
      order: [
        ["rating", "DESC"],
        ["experience", "DESC"],
      ],
    });
    console.log("✅ Found:", result.length, "experts");
    return result;
  } catch (err) {
    console.error("❌ findExpertsBySkill error:", err.message);
    throw err;
  }
};

const findExpertProfileByUserId = async (userId) => {
  return await ExpertProfile.findOne({ where: { userId } });
};

const createExpertProfile = async (data) => {
  return await ExpertProfile.create(data);
};

const updateExpertProfile = async (profile, data) => {
  return await profile.update(data);
};

module.exports = {
  findAllExperts,
  createExpert,
  updateExpertById,
  findExpertById,
  findRecommendedExperts,
  findOnlineExperts,
  bulkCreateSkills,
  searchExpertsBySkill,
  searchExpertsByHeadline,
  findExpertsBySkill,
  findExpertProfileByUserId,
  createExpertProfile,
  updateExpertProfile,
};