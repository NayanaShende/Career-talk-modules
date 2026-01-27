const { User } = require('../../models');

/* =========================
   CREATE USER
========================= */
exports.createUser = async (req, res) => {
  try {
    const user = await User.create({
      role: req.body.role,
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      location: req.body.location,
      experience_level: req.body.experience_level,
      skills: req.body.skills,
      resume_url: req.body.resume_url
    });

    res.status(201).json({
      message: 'User created successfully 🎉',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};
