import axios from "axios";

const API = axios.create({
baseURL: "http://192.168.1.16:3000/api",  
// IMPORTANT: Replace YOUR_IP_ADDRESS with your computer IP
});

export default API;
