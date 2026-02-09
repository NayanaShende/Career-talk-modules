const jwt = require("jsonwebtoken");
const { User } = require("../models");
const normalizeMobile = (m) => m.replace(/\D/g, "").slice(-10);

// ---------------------------------------
// SEND OTP
// ---------------------------------------
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile)
      return res
        .status(400)
        .json({ success: false, message: "Mobile required" });

    const normalizedMobile = normalizeMobile(mobile);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpiryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    let user = await User.findOne({ where: { mobile: normalizedMobile } });

    if (!user) {
      user = await User.create({ mobile: normalizedMobile, otp, otpExpiryAt });
    } else {
      user.otp = otp;
      user.otpExpiryAt = otpExpiryAt;
      await user.save();
    }

    console.log("OTP:", otp);

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// ---------------------------------------
// VERIFY OTP
// ---------------------------------------
exports.verifyOtp = async (req, res) => {
  try {
    let { mobile, otp } = req.body;

    if (!mobile || !otp)
      return res.status(400).json({ success: false, message: "Missing data" });

    const normalizedMobile = normalizeMobile(mobile);

    const user = await User.findOne({ where: { mobile: normalizedMobile } });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    if (String(user.otp) !== String(otp))
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    const now = Date.now();
    const expiry = new Date(user.otpExpiryAt).getTime();

    console.log("Now:", now, "Expiry:", expiry);

    // ✅ Correct expiry check
    if (now > expiry + 10 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpiryAt = null;
    user.isVerified = true;

    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      message: "OTP Verified",
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        role: user.role,
        hasProfile: user.hasProfile,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// ---------------------------------------
// SET ROLE
// ---------------------------------------
exports.setRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.userId;

    if (!role)
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });

    const user = await User.findByPk(userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.role = role;
    await user.save();

    return res.json({ success: true, message: "Role updated", role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
