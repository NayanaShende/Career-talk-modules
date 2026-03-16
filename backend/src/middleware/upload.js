const multer = require("multer");

// memory storage (needed for cloudinary)
const storage = multer.memoryStorage();

// file validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// multiple file upload
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "cv", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
]);

module.exports = {
  upload,
  uploadFields,
};
