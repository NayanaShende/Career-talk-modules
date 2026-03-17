// src/repositories/auth.repository.js

const { User } = require("../models");

const normalizeMobile = (mobile) =>
  String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);

const findUserByMobile = async (mobile) => {
  return await User.findOne({ where: { mobile } });
};

const createUser = async (data) => {
  return await User.create(data);
};

const updateUser = async (user, data) => {
  return await user.update(data);
};

const findUserById = async (id) => {
  return await User.findByPk(id);
};

module.exports = {
  normalizeMobile,
  findUserByMobile,
  createUser,
  updateUser,
  findUserById,
};
