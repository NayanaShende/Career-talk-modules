'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    role: DataTypes.ENUM('jobseeker', 'expert', 'admin'),
    name: DataTypes.TEXT,
    email: {
      type: DataTypes.TEXT,
      unique: true
    },
    mobile: {
      type: DataTypes.TEXT,
      unique: true
    },
    location: DataTypes.TEXT,
    experience_level: DataTypes.ENUM('fresher', 'junior', 'mid', 'senior'),
    skills: DataTypes.ARRAY(DataTypes.TEXT),
    resume_url: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User'
  });

  return User;
};
