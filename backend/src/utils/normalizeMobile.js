exports.normalizeMobile = (mobile) => {
  if (!mobile) return null;

  let cleaned = String(mobile).trim();

  // remove spaces & special chars
  cleaned = cleaned.replace(/\D/g, "");

  // remove country code if exists
  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.slice(-10);
  }

  return cleaned;
};