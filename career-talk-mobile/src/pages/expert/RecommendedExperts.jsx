import React from "react";
import "./RecommendedExperts.css"; // Import the CSS file

const experts = [
  {
    name: "Anita Verma",
    role: "Backend Developer",
    experience: 7,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Amit Singh",
    role: "Data Scientist",
    experience: 6,
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Rahul Sharma",
    role: "Frontend Developer",
    experience: 5,
    photo: "https://randomuser.me/api/portraits/men/46.jpg",
  },
];

function RecommendedExperts() {
  return (
    <div className="recommended-container">
      <h1>Recommended Experts</h1>
      <div className="experts-grid">
        {experts.map((expert, index) => (
          <div key={index} className="expert-card">
            <img src={expert.photo} alt={expert.name} className="expert-photo" />
            <h2>{expert.name}</h2>
            <p>{expert.role} ({expert.experience} yrs)</p>
            <button className="view-btn">View Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedExperts;
