// src/repositories/expert.repository.js

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

const findExpertByUserId = async (userId) => {
  return await Expert.findOne({ where: { userId } });
};

const updateExpertById = async (id, data) => {
  return await Expert.update(data, { where: { id } });
};

// ✅ FIXED: now returns userId field explicitly so chat works correctly
const findExpertById = async (id) => {
  const expert = await Expert.findOne({
    where: { id },
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
  });

  if (!expert) return null;

  // ✅ Return plain object with userId explicitly included
  return {
    ...expert.toJSON(),
    userId: expert.userId, // ✅ expert's User table ID for chat routing
  };
};

/* ===============================
   LISTING
================================ */

const findRecommendedExperts = async (limit) => {
  return await Expert.findAll({
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
      ["createdAt", "DESC"],
    ],
    limit,
  });
};

// ✅ FIXED: include User model so we can fallback to User.image if Expert.image is null
// This fixes the Live Expert card on dashboard not showing profile photo
const findOnlineExperts = async (limit) => {
  const experts = await Expert.findAll({
    where: { is_online: true },
    include: [
      ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
      {
        model: User,
        as: "user",
        attributes: ["id", "fullName", "image"], // ✅ pull user's image and fullName
      },
    ],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });

  // ✅ FIXED: if Expert.image is null, use User.image as fallback
  return experts.map((e) => {
    const plain = e.toJSON();
    return {
      ...plain,
      image: plain.image || plain.user?.image || null,
      name: plain.name || plain.user?.fullName || null,
    };
  });
};

/* ===============================
   SKILLS
================================ */

const bulkCreateSkills = async (skillRows) => {
  if (skillRows.length > 0) {
    await ExpertSkill.destroy({ where: { expert_id: skillRows[0].expert_id } });
  }
  return await ExpertSkill.bulkCreate(skillRows);
};

const deleteSkillsByExpertId = async (expertId) => {
  return await ExpertSkill.destroy({ where: { expert_id: expertId } });
};

const findExpertsBySkillName = async (skillName) => {
  return await Expert.findAll({
    include: [
      {
        model: ExpertSkill,
        as: "skills",
        where: { skill_name: { [Op.iLike]: `%${skillName}%` } },
        required: true,
      },
    ],
    order: [
      ["rating", "DESC"],
      ["experience", "DESC"],
    ],
  });
};

/* ===============================
   DOMAIN SEARCH
================================ */

const searchExpertsByHeadline = async (domain) => {
  try {
    console.log("🔍 Filtering by domain:", domain);
    const result = await Expert.findAll({
      where: { domain: { [Op.iLike]: `%${domain}%` } },
      include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
      order: [["rating", "DESC"], ["experience", "DESC"]],
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
    where: { domain: { [Op.iLike]: `%${domain}%` } },
    include: [{ model: ExpertSkill, as: "skills", required: false }],
  });
};

const findExpertsBySkill = async (domain) => {
  try {
    console.log("🔍 Searching domain:", domain);
    const result = await Expert.findAll({
      where: { domain: { [Op.iLike]: `%${domain}%` } },
      include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
      order: [["rating", "DESC"], ["experience", "DESC"]],
    });
    console.log("✅ Found:", result.length, "experts");
    return result;
  } catch (err) {
    console.error("❌ findExpertsBySkill error:", err.message);
    throw err;
  }
};

/* ===============================
   PROFILE
================================ */

const findExpertProfileByUserId = async (userId) => {
  return await Expert.findOne({
    where: { userId },
    include: ExpertSkill ? { model: ExpertSkill, as: "skills" } : [],
  });
};

const createExpertProfile = async (data) => {
  return await Expert.create(data);
};

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
  deleteSkillsByExpertId,
  findExpertsBySkillName,
  searchExpertsBySkill,
  searchExpertsByHeadline,
  findExpertsBySkill,
  findExpertProfileByUserId,
  createExpertProfile,
  updateExpertProfile,
  deleteExpert,
};