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

    // ✅ return only experts array
    return response.data.data;
    // ✅ normalize response
    return response?.data ?? { success: false, data: [] };

  } catch (error) {
    console.log(
      "Error fetching all experts:",
      error?.response?.data || error.message
    );

    return { success: false, data: [] };
  }
};


// get single expert by id (profile page)
export const getExpertById = async (id) => {
  try {
    const response = await API.get(`/experts/${id}`);

    // ✅ return only expert object
    return response.data.data;
    // ✅ normalize response
    return response?.data ?? { success: false, data: null };

  } catch (error) {
    console.log(
      "Error fetching expert:",
      error?.response?.data || error.message
    );

    return { success: false, data: null };
  }
};

// get online experts
export const getOnlineExperts = async () => {
  try {
    const response = await API.get("/experts/online");
    return response.data?.data || [];
  } catch (error) {
    console.log("Error fetching online experts:", error);
    return [];
  }
};