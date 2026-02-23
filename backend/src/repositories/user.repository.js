// src/repositories/user.repository.js

const { User, UserProfile } = require("../models");

const findUserByMobile = async (mobile) => {
  return await User.findOne({ where: { mobile } });
};

const createUser = async (data) => {
  return await User.create(data);
};

const saveUser = async (user) => {
  return await user.save();
};

const findProfileByUserId = async (userId) => {
  return await UserProfile.findOne({ where: { userId } });
};

const createProfile = async (data) => {
  return await UserProfile.create(data);
};

const updateProfile = async (profile, data) => {
  return await profile.update(data);
};

module.exports = {
  findUserByMobile,
  createUser,
  saveUser,
  findProfileByUserId,
  createProfile,
  updateProfile,
};
