const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },

  filename: function (req, file, cb) {
    // remove spaces & special characters
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueName = Date.now() + "-" + cleanName;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ FIXED: added "certificate" field so Multer accepts it without throwing
// "MulterError: Unexpected field"
const uploadFields = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "certificate", maxCount: 1 }, // ← this was missing
]);

module.exports = upload;
module.exports.uploadFields = uploadFields;
