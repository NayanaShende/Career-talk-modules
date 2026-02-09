import React, { useState } from "react";
import "./JobseekerPage.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const JobseekerPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    experience: "",
    domain: "",
    cv: null,
  });

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload (CV)
  const handleFileChange = (e) => {
    setFormData({ ...formData, cv: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("dob", formData.dob);
      payload.append("qualification", formData.qualification);
      payload.append("experience", formData.experience);
      payload.append("domain", formData.domain);

      if (formData.cv) {
        payload.append("cvFile", formData.cv);
      }

      // 🔥 Protected API call using token automatically
      await axiosInstance.post("/profile/create", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile created successfully!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Profile already exists or an error occurred.");
    }
  };

  return (
    <div className="job-wrapper">
      {/* Left Illustration */}
      <div className="left-section"></div>

      {/* Right Form */}
      <div className="right-section">
        <h2>Create Jobseeker Profile</h2>

        <form onSubmit={handleSubmit}>
          <label>FullName</label>
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
          />
          <label>Email</label>
          <input
            name="email"
            placeholder="Email"
            type="email"
            onChange={handleChange}
          />

          <label>Date of Birth:</label>
          <input name="dob" type="date" onChange={handleChange} />

          <label>Qualification</label>
          <input
            name="qualification"
            placeholder="Highest Qualification"
            onChange={handleChange}
          />

          <select
            name="experience"
            className="experience"
            onChange={handleChange}
          >
            <option value="">Experience Level</option>
            <option>Fresher</option>
            <option>1-3 Years</option>
            <option>3-5 Years</option>
            <option>5+ Years</option>
          </select>

          <input
            name="domain"
            placeholder="Looking for (Domain)"
            onChange={handleChange}
          />

          <br />

          <label className="file-label">Upload CV</label>
          <input name="cv" type="file" onChange={handleFileChange} />

          <button type="submit" className="job-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobseekerPage;
