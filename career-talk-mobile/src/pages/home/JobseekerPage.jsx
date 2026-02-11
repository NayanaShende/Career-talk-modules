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
    cvFile: null, // <-- rename to match backend field
  });

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, cvFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired! Please login again.");
        navigate("/");
        return;
      }
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("dob", formData.dob);
      payload.append("qualification", formData.qualification);
      payload.append("experience", formData.experience);
      payload.append("domain", formData.domain);

      if (formData.cvFile) {
        payload.append("cvFile", formData.cvFile); // MUST match backend key
      }

      const res = await axiosInstance.post("/profile/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // 🔥 VERY IMPORTANT
        },
      });

      console.log("🔥 SERVER RESPONSE:", res.data);
      alert(" Jobseeker Profile Created !");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ ERROR:", err);
      alert("Error occurred while submitting profile.");
    }
  };

  return (
    <div className="job-wrapper">
      <div className="left-section"></div>

      <div className="right-section">
        <h2 className="form-title">Create Your Jobseeker Profile</h2>

        <form className="job-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Highest Qualification</label>
            <input
              name="qualification"
              type="text"
              placeholder="e.g., B.Tech, MBA"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Experience Level</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            >
              <option value="">Select experience level</option>
              <option>Fresher</option>
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
            </select>
          </div>

          <div className="form-group">
            <label>Desired Domain / Job Role</label>
            <input
              name="domain"
              type="text"
              placeholder="e.g., Web Development"
              value={formData.domain}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload CV</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="job-submit-btn">
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobseekerPage;
