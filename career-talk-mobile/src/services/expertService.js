const API_BASE_URL = "http://localhost:3000/api";

// GET recommended experts
export const getRecommendedExperts = async () => {
  const response = await fetch(
    `${API_BASE_URL}/experts/recommended`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch experts");
  }

  // backend returns: { success: true, data: [...] }
  return response.json();
};

// SEARCH experts by skill / domain / experience
export const searchExperts = async (query) => {
  const response = await fetch(
    `${API_BASE_URL}/experts/search?skill=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search experts");
  }

  return response.json();
};
// ✅ GET ALL experts (for Search page)
export const getAllExperts = async () => {
  const response = await fetch(
    `${API_BASE_URL}/experts`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch all experts");
  }

  return response.json();
};
