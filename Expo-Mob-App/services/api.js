import axios from "axios";

const API = axios.create({
  baseURL: "http://172.20.10.2:3000/api",   // <-- keep YOUR PC IP here
});

export default API;
