import { useEffect, useState } from "react";
import { getExperts } from "../../api/expertApi";
import "./TopExperts.css";

export default function TopExperts() {
  const [experts, setExperts] = useState([]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const res = await getExperts();
        setExperts(res.data.data);
      } catch (err) {
        console.error("Error fetching experts:", err);
      }
    };

    fetchExperts();
  }, []);

  return (
    <div className="experts-section">
      <h2>Top Experts</h2>

      <div className="experts-grid">
        {experts.map((e) => (
          <div key={e.id} className="expert-card">
            <h4>{e.name}</h4>
            <p>{e.headline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
