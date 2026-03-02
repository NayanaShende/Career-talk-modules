const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },

  filename: function (req, file, cb) {
    // ✅ remove spaces & special characters
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");

    const uniqueName = Date.now() + "-" + cleanName;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// accept cv & image
const uploadFields = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

module.exports = upload;
module.exports.uploadFields = uploadFields;
