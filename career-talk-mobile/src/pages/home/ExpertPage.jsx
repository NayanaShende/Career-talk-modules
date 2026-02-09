import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "./ExpertPage.css";

const ExpertPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    experience: "",
    domain: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/profile/create", formData);

      alert("Expert Profile Created Successfully!");
      navigate("/home");
    } catch (err) {
      console.log(err);
      alert("Profile already exists or error occurred");
    }
  };

  return (
    <div className="expert-wrapper">
      <div className="expert-card">
        <h2>Create Expert Profile</h2>

        <form onSubmit={submitProfile}>
          <input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
          />

          <input
            name="qualification"
            placeholder="Highest Qualification"
            value={formData.qualification}
            onChange={handleChange}
          />

          <select
            name="experience"
            onChange={handleChange}
            value={formData.experience}
          >
            <option value="">Experience Level</option>
            <option>1-3 Years</option>
            <option>3-5 Years</option>
            <option>5+ Years</option>
            <option>10+ Years</option>
          </select>

          <input
            name="domain"
            placeholder="Expertise Domain"
            value={formData.domain}
            onChange={handleChange}
          />

          <button type="submit" className="expert-submit-btn">
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpertPage;
