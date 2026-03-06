import React from "react";
import "./RoleSelection.css";
import userIcon from "../../assets/home/user.png";
import expertIcon from "../../assets/home/expert.png";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  // 🔥 Save role to backend and navigate to profile page
  const handleRoleSelect = async (role) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      // Call backend to save selected role
      await axiosInstance.post(
        "/auth/set-role",
        { role },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Navigate to the profile page based on role
      if (role === "jobseeker") navigate("/jobseeker");
      else if (role === "expert") navigate("/expert");
      else navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error setting role. Please try again.");
    }
  };

  return (
    <div className="role-wrapper">
      <div className="role-card">
        <h1 className="role-title">Select Your Role</h1>

        <div className="role-options">
          {/* JOB SEEKER */}
          <div
            className="role-option"
            onClick={() => handleRoleSelect("jobseeker")}
          >
            <div className="role-circle">
              <img src={userIcon} alt="Job Seeker" />
            </div>
            <p className="role-text">Jobseeker</p>
          </div>

          {/* EXPERT */}
          <div
            className="role-option"
            onClick={() => handleRoleSelect("expert")}
          >
            <div className="role-circle">
              <img src={expertIcon} alt="Expert" />
            </div>
            <p className="role-text">Expert</p>
          </div>
        </div>

        <button className="back-btn" onClick={() => navigate("/")}>
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
