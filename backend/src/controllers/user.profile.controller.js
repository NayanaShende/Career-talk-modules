// src/controllers/user.profile.controller.js

const userService = require("../services/user.service");

export default function ProfileScreen() {
  const [role, setRole] = useState("Jobseeker");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
  };

    const profile = await userService.createUserProfile(
      req.user.id,
      req.body,
      req.file
    );

    // Mark user as having completed profile
    await req.user.update({ hasProfile: true });

      await axios.post(
        "http://192.168.1.17:3000/api/auth/set-role",
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

// ----------------------------------
// GET USER PROFILE
// ----------------------------------
exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);

    return res.json({ success: true, data: profile });
  } catch (err) {
    if (err.message === "Profile not found") {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    console.error("❌ ERROR fetching user profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
