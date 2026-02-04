import React, { useState } from "react";
import axios from "axios";
import "./ExpertPage.css";


const ExpertPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    qualification: "",
    experience: "",
    domain: "",
    bio: "",
    certificate: null,
  });

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setFormData({ ...formData, certificate: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      await axios.post("https://your-api-url.com/expert", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Expert profile created successfully!");
    } catch (error) {
      alert("Failed to create profile");
      console.error(error);
    }
  };

  return (
    <div className="expert-wrapper">
      {/* LEFT IMAGE */}
      <div className="left-sections">
        {/* <img src={expertImg} alt="expert" className="expert-image" /> */}
      </div>

      {/* RIGHT FORM */}
      <div className="right-sections">
        <h2>Create Expert Profile</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            type="email"
            onChange={handleChange}
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            onChange={handleChange}
          />

          <input
            name="qualification"
            placeholder="Highest Qualification"
            onChange={handleChange}
          />

          <select name="experience" className="experience" onChange={handleChange}>
            <option value="">Years of Experience</option>
            <option>0–1 years</option>
            <option>1–3 years</option>
            <option>3–5 years</option>
            <option>5–10 years</option>
            <option>10+ years</option>
          </select>

          <input
            name="domain"
            placeholder="Expertise / Domain"
            onChange={handleChange}
          />

          <textarea
            name="bio"
            placeholder="Short Bio"
            rows="2"
            onChange={handleChange}
          ></textarea>

          <label className="file-label">Certification (Optional)</label>
          <input name="certificate" type="file" onChange={handleChange} />

          <button type="submit" className="expert-submit-btn">
            Submit
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default ExpertPage;
