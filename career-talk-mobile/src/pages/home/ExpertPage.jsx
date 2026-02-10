import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";


const ExpertPage = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    experience: "",
    domain: "",
    certifications: "",
    linkedIn: "",
    cv: null,
  });

  // Handle text input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle CV file
  const handleFileChange = (e) => {
    setFormData({ ...formData, cv: e.target.files[0] });
  };

  // ⭐ Your handleSubmit should be here
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
      payload.append("certifications", formData.certifications); // fixed
      payload.append("linkedIn", formData.linkedIn); // fixed

      if (formData.cv) {
        payload.append("cv", formData.cv);
      }

      const res = await axiosInstance.post("/expert/create", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("🔥 SERVER RESPONSE:", res.data);
      alert(res.data.message || "Expert Profile Created!");

      // Navigate after success
      navigate("/home");
    } catch (error) {
      console.error("Error submitting expert profile:", error);
      alert(error.response?.data?.message || "Error creating expert profile");
    }
  };



  return (
    <div className="expert-wrapper">
      {/* RIGHT HERE add your form UI */}
      <div className="right-section">
        <h2 className="form-title">Create Your Expert Profile</h2>

        <form className="expert-form" onSubmit={handleSubmit}>
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
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
              <option>10+ Years</option>
            </select>
          </div>

          <div className="form-group">
            <label>Expertise Domain</label>
            <input
              name="domain"
              type="text"
              placeholder="e.g., Web Development, Marketing"
              value={formData.domain}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Certifications</label>
            <input
              name="certifications"
              type="text"
              placeholder="e.g., AWS, PMP"
              value={formData.certifications}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              name="linkedIn"
              type="url"
              placeholder="LinkedIn profile URL"
              value={formData.linkedIn}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Upload CV</label>
            <input name="cv" type="file" onChange={handleFileChange} />
          </div>

          <button type="submit" className="job-submit-btn">
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpertPage;
