const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const getImageUri = (image, name) => {
  if (image && image.trim()) {
    // ✅ Already a full URL (Cloudinary or any http URL) — return as is
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // ✅ Local file — strip uploads/ prefix and build full URL
    const filename = image.replace(/^uploads[\\/]/, "");
    return `${BASE_URL}/uploads/${filename}`;
  }

  // ✅ Fallback avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Expert",
  )}&background=0B2D72&color=fff&size=128`;
};

module.exports = getImageUri;