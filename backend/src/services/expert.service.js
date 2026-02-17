const { Expert, ExpertSkill } = require("../models");
const { Op } = require("sequelize");

// ✅ Recommended experts
exports.getRecommendedExperts = async () => {
  try {
    return await Expert.findAll({
      limit: 5,
      order: [["experience_years", "DESC"]],
    });
  } catch (error) {
    console.error("Service Error (Recommended):", error);
    throw error;
  }
};

// ✅ Search experts by skill (ONLY ONE FUNCTION)
exports.searchExperts = async (skill) => {
  try {

    // No skill → return all
    if (!skill) {
      return await Expert.findAll();
    }

    return await Expert.findAll({
      include: {
        model: ExpertSkill,
        as: "skills",
        where: {
          skill_name: {
            [Op.iLike]: `%${skill}%`
          }
        },
        required: false
      }
    });

  } catch (error) {
    console.error("Service Error (Search):", error);
    throw error;
  }
};

exports.createExpert = async (data) => {
  return await Expert.create(data);
};

exports.updateProfile = async (id, data) => {
  await Expert.update(data, { where: { id } });
  return await Expert.findByPk(id);
};

exports.addSkills = async (expert_id, skills) => {
  const payload = skills.map((s) => ({
    expert_id,
    skill_name: s
  }));

  return await ExpertSkill.bulkCreate(payload);
};
