import API from "./api";

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
  return await axiosInstance.get("/experts/recommended");
};