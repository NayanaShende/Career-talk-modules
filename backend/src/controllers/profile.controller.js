const { UserProfile } = require("../models");

exports.createProfile = async (req, res) => {
  try {
    return res.json({ success: true, message: "Profile created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    return res.json({ success: true, message: "Profile fetched" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
