const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Accept both "cv" and "image" fields
const uploadFields = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

module.exports = upload;
module.exports.uploadFields = uploadFields;