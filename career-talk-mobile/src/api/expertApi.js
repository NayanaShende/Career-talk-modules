import api from "./axios";

// get all experts
export const getExperts = () => api.get("/experts");

// create expert
export const createExpert = (data) => api.post("/experts", data);

// add skill
export const addSkill = (expertId, data) =>
  api.post(`/experts/${expertId}/skills`, data);

// search experts
export const searchExperts = (query) =>
  api.get(`/experts/search?q=${query}`);
