import React from "react";
import "./RoleSelection.css";
import userIcon from "../../assets/user.png";
import expertIcon from "../../assets/expert.png";
import { useNavigate } from "react-router-dom";


const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="role-wrapper">
      <div className="role-card">
        <h1 className="role-title">Select Your Role</h1>

        <div className="role-options">
          <div className="role-option" onClick={() => navigate("/jobseeker")}>
            <div className="role-circle">
              <img src={userIcon} alt="Job Seeker" />
            </div>
            <p className="role-text">Jobseeker</p>
          </div>

          <div className="role-option" onClick={() => navigate("/expert")}>
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
