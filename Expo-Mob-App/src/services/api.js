import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://172.20.10.9:3000/api", 
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
