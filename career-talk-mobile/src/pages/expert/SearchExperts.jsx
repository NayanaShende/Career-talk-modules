import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SearchExperts.css";

// ✅ only correct service path (mobile app services)
import { getAllExperts } from "../../services/expertService";

export default function SearchExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        // ✅ fetch ALL experts
        const response = await getAllExperts();

        // backend returns { success: true, data: [...] }
        setExperts(response.data || []);
      } catch (error) {
        console.error("Error fetching experts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading experts...</p>;
  }

  return (
    <div className="search-page">
      <h1>Search Experts</h1>

      <div className="search-box-wrapper">
        <span className="search-icon"></span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by skill, domain, experience..."
        />
      </div>

      <div className="experts-row">
        {experts.length === 0 ? (
          <p>No experts found</p>
        ) : (
          experts.map((expert) => (
            <div className="expert-card" key={expert.id}>
              <img
                src={expert.image || "https://via.placeholder.com/150"}
                alt={expert.name}
              />

              <h3>{expert.name}</h3>

              <p>
                <strong>{expert.role || "Expert"}</strong> ({expert.experience} yrs)
              </p>

              <Link to={`/expert/${expert.id}`}>
                <button className="view-btn">View Profile</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
