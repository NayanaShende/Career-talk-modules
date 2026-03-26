import API from "./api";

export const searchExperts = async (keyword) => {
  try {
    const response = await API.get(`/experts?search=${keyword}`);
    // ✅ normalize response
    return response?.data ?? { success: false, data: [] };
  } catch (error) {
    console.log("Error fetching experts:", error?.response?.data || error.message);
    return { success: false, data: [] };
  }
};

export const getRecommendedExperts = async () => {
  try {
    const response = await API.get("/experts/recommended");
    // ✅ normalize response
    return response?.data ?? { success: false, data: [] };
  } catch (error) {
    console.log(
      "Error fetching recommended experts:",
      error?.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};

// get all experts (dashboard list)
export const getAllExperts = async () => {
  try {
    const response = await API.get("/experts");
    // ✅ FIXED: removed dead code (second return after first return was never reached)
    // ✅ safely extract array, fallback to empty array
    return response?.data?.data ?? [];
  } catch (error) {
    console.log(
      "Error fetching all experts:",
      error?.response?.data || error.message
    );
    return [];
  }
};

// get single expert by id (profile page)
export const getExpertById = async (id) => {
  try {
    const response = await API.get(`/experts/${id}`);
    // ✅ FIXED: removed dead code (second return after first return was never reached)
    // ✅ safely extract object, fallback to null
    return response?.data?.data ?? null;
  } catch (error) {
    console.log(
      "Error fetching expert:",
      error?.response?.data || error.message
    );
    return null;
  }
};

// ✅ FIXED: get online experts — now returns consistent { success, data } shape
// so the screen component can check response.success and read response.data
export const getOnlineExperts = async () => {
  try {
    const response = await API.get("/experts/online");
    const experts = response?.data?.data ?? response?.data ?? [];
    return { success: true, data: Array.isArray(experts) ? experts : [] };
  } catch (error) {
    console.log(
      "Error fetching online experts:",
      error?.response?.data || error.message
    );
    return { success: false, data: [] };
  }
};