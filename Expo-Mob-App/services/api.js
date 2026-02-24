import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.10:3000/api",
  timeout: 10000, // prevent hanging requests
});

API.interceptors.response.use(

  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ✅ Get all experts
export const getExperts = async () => {
  const response = await API.get("/experts");
  return response.data;
};

// ✅ Get experts filtered by skill
export const getExpertsBySkill = async (skill) => {
  if (!skill || skill === "All") {
    const response = await API.get("/experts");
    return response.data;
  }
  const response = await API.get(`/experts?skill=${skill}`);
  return response.data;
};

export default API;