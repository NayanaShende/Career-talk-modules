import axios from "axios";

// ✅ CHANGE ONLY THIS IF YOUR PC IP CHANGES
const API = axios.create({
  baseURL: "http://192.168.1.13:3000/api", // ✅ FIXED (two slashes)
  timeout: 10000,
});

// ✅ OPTIONAL: helpful logging for debugging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(
      "API ERROR:",
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default API;
