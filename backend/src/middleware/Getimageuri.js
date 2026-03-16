const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const getImageUri = (image, name) => {
  if (image && image.trim()) {
    const filename = image.replace(/^uploads[\\/]/, "");
    return `${BASE_URL}/uploads/${filename}`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Expert",
  )}&background=0B2D72&color=fff&size=128`;
};

module.exports = getImageUri;
