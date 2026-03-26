import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "http://172.20.10.3:3000/api",
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

// ✅ FIXED: Get online experts (was missing — backend has /api/experts/online)
export const getOnlineExperts = async () => {
  const response = await API.get("/experts/online");
  return response.data;
};

// ✅ FIXED: Get single expert by ID
export const getExpertById = async (id) => {
  const response = await API.get(`/experts/${id}`);
  return response.data;
};

// ✅ FIXED: Get current logged-in user profile (was missing — caused "No Name / Not available")
export const getMyProfile = async () => {
  const response = await API.get("/users/profile");
  return response.data;
};

// ✅ FIXED: Update current user profile
export const updateMyProfile = async (profileData) => {
  const response = await API.put("/users/profile", profileData);
  return response.data;
};

// ✅ FIXED: Get any user by ID
export const getUserById = async (id) => {
  const response = await API.get(`/users/${id}`);
  return response.data;
};

// ✅ Auth: Login
export const loginUser = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

// ✅ Auth: Register
export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export default API;