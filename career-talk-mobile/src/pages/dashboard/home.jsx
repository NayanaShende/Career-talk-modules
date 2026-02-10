import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./home.css";

export default function Home() {
  const [skill, setSkill] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!skill) return alert("Enter skill");
    navigate(`/search?skill=${skill}&location=${location}`);
  };

  const quickSearch = (value) => {
    navigate(`/search?skill=${value}`);
  };

  return (
    <div className="hero">

      <h1>Find Your Dream Career</h1>

      {/* ✅ subtitle (missing part) */}
      <p className="subtitle">
        Search from 5 lakh+ jobs & get guidance from 10,000+ experts
      </p>

      {/* ✅ search box with location (missing part) */}
      <div className="search-box">
        <input
          className="skill-input"
          placeholder="Search jobs, companies, skills..."
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />     <button onClick={handleSearch}>Search</button>
      </div>

      {/* ✅ quick search buttons (missing part) */}
      <div className="quick-search">
        <span>Quick Search:</span>

        <button onClick={() => quickSearch("Product Manager")}>
          Product Manager
        </button>

        <button onClick={() => quickSearch("Software Engineer")}>
          Software Engineer
        </button>

        <button onClick={() => quickSearch("Data Scientist")}>
          Data Scientist
        </button>

        <button onClick={() => quickSearch("Designer")}>
          Designer
        </button>
      </div>

    </div>
  );
}
