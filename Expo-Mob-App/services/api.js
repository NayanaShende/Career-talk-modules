import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.6:3000/api", // <-- keep YOUR PC IP here
});

export default API;
