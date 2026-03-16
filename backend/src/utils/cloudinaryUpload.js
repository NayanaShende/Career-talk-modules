require("dotenv").config();
const cloudinary = require("../../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "career-talk",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      )
      .end(fileBuffer);
  });
};

// 🔥 Test code
const test = async () => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    );

    console.log("✅ Cloudinary working");
    console.log("URL:", result.secure_url);
  } catch (err) {
    console.error("❌ Cloudinary error:", err.message);
  }
};

test();

module.exports = uploadToCloudinary;
