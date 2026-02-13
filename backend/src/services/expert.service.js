const { Expert, ExpertSkill } = require("../models");
const { Op } = require("sequelize");
// Recommended experts (rating + experience) ✅ KEEP AS IS
exports.getRecommendedExperts = async () => {
  try {
    return await Expert.findAll({
      limit: 5,
    order: [
      ["experience_years", "DESC"] // ✅ correct column
    ]
    });
  } catch (error) {
    console.error("Service Error (Recommended):", error);
    throw error;
  }
};

// Search experts by skill ✅ SAFE & BEGINNER-FRIENDLY
exports.searchExperts = async (skill) => {
  try {
    // 1️⃣ No skill → return all experts
    if (!skill) {
      return await Expert.findAll();
    }

    // 2️⃣ Try matching skill from TEXT[]
    const matchedExperts = await Expert.findAll({
      where: {
        skills: {
          [Op.overlap]: [skill], // PostgreSQL TEXT[]
        },
      },
    });

    // 3️⃣ If no match found → return ALL experts (important!)
    if (matchedExperts.length === 0) {
      return await Expert.findAll();
    }

    // 4️⃣ Otherwise return matched experts
    return matchedExperts;
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

exports.searchExperts = async (skill) => {
  return await Expert.findAll({
    include: {
      model: ExpertSkill,
      as: "skills",
      where: { skill_name: skill }
    }
  });
};

