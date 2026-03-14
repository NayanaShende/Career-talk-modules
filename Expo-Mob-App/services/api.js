import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "http://192.168.1.19:3000/api",
  timeout: 10000, // prevent hanging requests
});



// ✅ FIXED: Attach token to every request automatically
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error?.response?.data || error.message);
    return Promise.reject(error);
  },
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
