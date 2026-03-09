// ✅ FIXED: image field from DB is just the filename e.g. "1234567-profile.jpg"
// We must build the full URL as BASE_URL/uploads/filename
// Previously it was doubling "uploads" or getting undefined
const getImageUri = (image, name) => {
  if (image && image.trim()) {
    // ✅ Handle both cases:
    // 1. image = "1234567-photo.jpg"  → BASE_URL/uploads/1234567-photo.jpg
    // 2. image = "uploads/1234567-photo.jpg" (stored with path prefix) → BASE_URL/uploads/...
    const filename = image.replace(/^uploads[\\/]/, ""); // strip prefix if present
    return `${BASE_URL}/uploads/${filename}`;
  }
  // ✅ Fallback: auto-generated avatar with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Expert")}&background=0B2D72&color=fff&size=128`;
};
