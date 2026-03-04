// src/repositories/expert.repository.js

// ✅ REMOVED ExpertProfile — model does not exist
const { Expert, ExpertSkill, User } = require("../models");
const { Op } = require("sequelize");

/* ===============================
   BASIC CRUD
================================ */

const findAllExperts = async () => {
  return await Expert.findAll({
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
    ],
  });
};

const createExpert = async (data) => {
  return await Expert.create(data);
};

// ✅ Used in auth.service
const findExpertByUserId = async (userId) => {
  return await Expert.findOne({ where: { userId } });
};

const updateExpertById = async (id, data) => {
  return await Expert.update(data, { where: { id } });
};

const findExpertById = async (id) => {
  return await Expert.findOne({
    where: { id },
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
  });
};

/* ===============================
   LISTING
================================ */

const findRecommendedExperts = async (limit) => {
  return await Expert.findAll({
    // ✅ FIXED: now includes skills + sorted by rating and experience
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
      ["createdAt", "DESC"],
    ],
    limit,
  });
};

const findOnlineExperts = async (limit) => {
  return await Expert.findAll({
    where: { is_online: true },
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });
};

/* ===============================
   SKILLS
================================ */

const bulkCreateSkills = async (skillRows) => {
  // ✅ FIXED: delete old skills first to avoid duplicates on re-save
  if (skillRows.length > 0) {
    await ExpertSkill.destroy({ where: { expert_id: skillRows[0].expert_id } });
  }
  return await ExpertSkill.bulkCreate(skillRows);
};

// ✅ NEW: delete all skills for an expert before re-saving
const deleteSkillsByExpertId = async (expertId) => {
  return await ExpertSkill.destroy({ where: { expert_id: expertId } });
};

// ✅ NEW: Filter experts by skill_name in ExpertSkills table
const findExpertsBySkillName = async (skillName) => {
  return await Expert.findAll({
    include: [
      {
        model: ExpertSkill,
        as: "skills",
        where: { skill_name: { [Op.iLike]: `%${skillName}%` } },
        required: true, // INNER JOIN — only experts who have this skill
      },
    ],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
    ],
  });
};

/* ===============================
   DOMAIN SEARCH (UPDATED)
================================ */

// 🔥 Search by domain OR skills
const searchExpertsByHeadline = async (domain) => {
  try {
    console.log("🔍 Filtering by domain:", domain);

    const result = await Expert.findAll({
      where: {
        domain: { [Op.iLike]: `%${domain}%` },
      },
      include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
      order: [
        ["rating", "DESC"],
        ["experience", "DESC"],
      ],
    });

    console.log("✅ Found:", result.length, "experts for domain:", domain);
    return result;
  } catch (err) {
    console.error("❌ searchExpertsByHeadline error:", err.message);
    throw err;
  }
};

const searchExpertsBySkill = async (domain) => {
  if (!domain) return await Expert.findAll({
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
  });

  return await Expert.findAll({
    where: {
      domain: { [Op.iLike]: `%${domain}%` },
    },
    include: [
      // ✅ FIXED: also search inside ExpertSkills table
      {
        model: ExpertSkill,
        as: "skills",
        required: false,
      },
    ],
  });
};

const findExpertsBySkill = async (domain) => {
  try {
    console.log("🔍 Searching domain:", domain);

    const result = await Expert.findAll({
      where: { domain: { [Op.iLike]: `%${domain}%` } },
      include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
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

/* ===============================
   PROFILE — ✅ FIXED: now uses Expert table via userId FK
================================ */

// ✅ FIXED: search in Expert table, not ExpertProfile
// ✅ Returns null instead of throwing if not found
const findExpertProfileByUserId = async (userId) => {
  return await Expert.findOne({
    where: { userId },
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
  });
};

// ✅ FIXED: create row in Expert table
const createExpertProfile = async (data) => {
  return await Expert.create(data);
};

// ✅ FIXED: update the expert instance directly
const updateExpertProfile = async (expert, data) => {
  return await expert.update(data);
};

/* ===============================
   DELETE
================================ */

const deleteExpert = async (id) => {
  const expert = await Expert.findByPk(id);
  if (!expert) return null;
  await expert.destroy();
  return expert;
};

module.exports = {
  findAllExperts,
  createExpert,
  findExpertByUserId,
  updateExpertById,
  findExpertById,
  findRecommendedExperts,
  findOnlineExperts,
  bulkCreateSkills,
  deleteSkillsByExpertId,     // ✅ NEW: used in user.controller saveProfile
  findExpertsBySkillName,     // ✅ NEW
  searchExpertsBySkill,
  searchExpertsByHeadline,
  findExpertsBySkill,
  findExpertProfileByUserId,  // ✅ now queries Expert table
  createExpertProfile,        // ✅ now creates in Expert table
  updateExpertProfile,        // ✅ now updates Expert instance
  deleteExpert,
};