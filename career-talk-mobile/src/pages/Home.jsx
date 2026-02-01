import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Career Talk</h1>

      <button className="home-btn" onClick={goToLogin}>
        Log-In
      </button>
    </div>
  );
};

export default Home;
