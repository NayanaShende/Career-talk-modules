import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Home.css";

const Home = () => {
  const [available, setAvailable] = useState(true);

  return (
    <div className="home-layout">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* RIGHT CONTENT */}
      <div className="home-content">
        {/* TOP BAR */}
        <div className="top-bar">
          <h2>Career Talk </h2>
        </div>

        {/* ALERT */}
        <div className="profile-alert">
          Complete your profile
        </div>

        {/* STATS CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <p>Profile Completeness</p>
            <h1>45%</h1>
          </div>

          <div className="stat-card">
            <p>Active Slots</p>
            <h1>12</h1>
          </div>

          <div className="stat-card">
            <p>Total Sessions</p>
            <h1>5</h1>
          </div>
        </div>

        {/* AVAILABILITY BAR */}
        <div className="availability-bar">
          <span>Available</span>

          <label className="switch">
            <input
              type="checkbox"
              checked={available}
              onChange={() => setAvailable(!available)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Home;
