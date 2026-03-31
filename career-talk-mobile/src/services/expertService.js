import { API_URL as API_BASE_URL } from "../config";

// GET recommended experts
export const getRecommendedExperts = async () => {
  const response = await fetch(`${API_BASE_URL}/experts/recommended`);

  if (!response.ok) {
    throw new Error("Failed to fetch experts");
  }

  const json = await response.json();
  return json.data;   // ✅ IMPORTANT
};


// SEARCH experts
export const searchExperts = async (query) => {
  const response = await fetch(
    `${API_BASE_URL}/experts/search?skill=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search experts");
  }

  const json = await response.json();
  return json.data;   // ✅ IMPORTANT
};


// GET ALL experts
export const getAllExperts = async () => {
  const response = await fetch(`${API_BASE_URL}/experts`);

  if (!response.ok) {
    throw new Error("Failed to fetch all experts");
  }

  const json = await response.json();
  return json.data;   // ✅ IMPORTANT
};
