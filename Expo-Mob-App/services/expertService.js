import API from "./api";


// ===============================
// EXISTING CODE (UNCHANGED)
// ===============================

export const searchExperts = async (keyword) => {
  try {
    const response = await API.get(`/experts?search=${keyword}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching experts:", error);
    return [];
  }
};

export const getRecommendedExperts = async () => {
  try {
    const response = await API.get("/experts/recommended");
    return response.data;
  } catch (error) {
    console.log("Error fetching recommended experts:", error);
    return [];
  }
};


// ===============================
// ✅ NEW FUNCTIONS (ADDED ONLY)
// ===============================

// get all experts (dashboard list)
export const getAllExperts = async () => {
  try {
    const response = await API.get("/experts");

    // ✅ return only experts array
    return response.data.data;

  } catch (error) {
    console.log("Error fetching all experts:", error);
    return [];
  }
};


// get single expert by id (profile page)
export const getExpertById = async (id) => {
  try {
    const response = await API.get(`/experts/${id}`);

    // ✅ return only expert object
    return response.data.data;

  } catch (error) {
    console.log("Error fetching expert:", error);
    return null;
  }
};
