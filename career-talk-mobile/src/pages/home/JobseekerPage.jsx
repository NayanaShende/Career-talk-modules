import React, { useState } from "react";
import axios from "axios";
import "./JobseekerPage.css";


const JobseekerPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    qualification: "",
    skills: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("https://your-api-url.com/jobseeker", formData);
      alert("Form submitted successfully!");
    } catch (error) {
      alert("Form submission failed");
      console.error(error);
    }
  };

  return (
    
    <div className="job-wrapper">
      {/* Left Illustration */}
      <div className="left-section">
        {/* <img src={jobImg} alt="jobseeker" className="job-image" /> */}
      </div>

      {/* Right Form */}
      <div className="right-section">
        <h2>Create Jobseeker Profile</h2>

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

          <input name="birthDate" type="date" onChange={handleChange} />

          <input
            name="qualification"
            placeholder="Highest Qualification"
            onChange={handleChange}
          />

          <select name="experience" className="experience" onChange={handleChange}>
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
                  <input name="cv" type="file" onChange={handleChange} />
                  
          <button type="submit" className="job-submit-btn">
            Submit
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default JobseekerPage;
