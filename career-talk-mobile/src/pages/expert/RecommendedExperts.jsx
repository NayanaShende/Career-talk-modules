import React, { useEffect, useState } from "react";
import "./RecommendedExperts.css";
import { getRecommendedExperts } from "../../services/expertService";

// ✅ KEEP STATIC DATA (fallback)
const experts = [
  {
    name: "Anita Verma",
    role: "Backend Developer",
    experience: 7,
  },
  {
    name: "Amit Singh",
    role: "Data Scientist",
    experience: 6,
  },
  {
    name: "Rohit Sharma",
    role: "Frontend Developer",
    experience: 5,
  },
];

function RecommendedExperts() {
  // ✅ NEW STATE for backend data
  const [apiExperts, setApiExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH from backend
  const fetchRecommendedExperts = async () => {
    try {
      const response = await getRecommendedExperts();
      console.log("Recommended Experts API:", response);

      // backend returns { success, data }
      if (response?.data?.length > 0) {
        setApiExperts(response.data);
      }
    } catch (error) {
      console.error("Failed to load recommended experts:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ load on page open
  useEffect(() => {
    fetchRecommendedExperts();
  }, []);

  // ✅ Decide which data to show
  const displayExperts = apiExperts.length > 0 ? apiExperts : experts;

  return (
    <div className="recommended-container">
      <h1>Top Experts</h1>

      {loading && <p>Loading top experts...</p>}

     
      <div className="experts-grid">
        {displayExperts.map((expert, index) => (
          <div key={expert.id || index} className="expert-card">
            <img
              src={
                expert.photo ||
                expert.image ||
                "https://via.placeholder.com/150"
              }
              alt={expert.name}
              className="expert-photo"
            />

            <h2>{expert.name}</h2>

            <p>
              <strong>{expert.role || "Expert"}</strong> ({expert.experience}{" "}
              yrs)
            </p>

            <p>
              {expert.role} ({expert.experience} yrs)
            </p>
            <button className="view-btn">View Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedExperts;
