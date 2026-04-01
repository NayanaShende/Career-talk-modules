import axios from "axios";

import { API_URL } from "../config";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired user tokens globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized/Token Expired: Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to main login page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
