// test-cloudinary.js
require("dotenv").config();
const cloudinary = require("./config/cloudinary");

cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "career-talk" },
  (error, result) => {
    if (error) {
      console.error("❌ Failed:", error.message);
    } else {
      console.log("✅ Success! URL:", result.secure_url);
    }
  },
);
