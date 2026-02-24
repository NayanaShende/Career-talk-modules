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
  return await Expert.findByPk(id);
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

const searchExpertsBySkill = async (skill) => {
  if (!skill) return await Expert.findAll();

  return await Expert.findAll({
    include: {
      model: ExpertSkill,
      as: "skills",
      where: {
        skill_name: { [Op.iLike]: `%${skill}%` },
      },
      required: false,
    },
  });
};

const searchExpertsByHeadline = async (skill) => {
  return await Expert.findAll({
    where: {
      headline: { [Op.iLike]: `%${skill}%` },
    },
  });
};

// ✅ Find experts by skill column
const findExpertsBySkill = async (skill) => {
  try {
    console.log("🔍 Searching skill:", skill);
    const result = await Expert.findAll({
      where: {
        skill: { [Op.iLike]: `%${skill}%` },
      },
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

exports.deleteExpert = async (id) => {
  const query = `DELETE FROM experts WHERE id = $1 RETURNING *`;
  const result = await db.query(query, [id]);
  return result.rows[0];
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