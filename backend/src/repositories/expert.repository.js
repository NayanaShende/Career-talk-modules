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
  findExpertProfileByUserId,
  createExpertProfile,
  updateExpertProfile,
};
