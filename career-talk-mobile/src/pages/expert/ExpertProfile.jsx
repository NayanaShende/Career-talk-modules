import { useParams } from "react-router-dom";
import expertsData from "../../utils/expertsData";
import "./Expert.css";

function ExpertProfile() {
  const { id } = useParams();
  const expert = expertsData.find(
    (exp) => exp.id === parseInt(id)
  );

  if (!expert) {
    return <h2>Expert Not Found</h2>;
  }

  return (
  <div className="expert-profile">
    <img
      src={expert.photo}
      alt={expert.name}
      style={{
        width: "200px",
        borderRadius: "10px",
        marginBottom: "15px",
      }}
    />

    <h2>{expert.name}</h2>
    <p><b>Skill:</b> {expert.skill}</p>
    <p><b>Domain:</b> {expert.domain}</p>
    <p><b>Experience:</b> {expert.experience} years</p>
    <p><b>Rating:</b> ⭐ {expert.rating}</p>
  </div>
);
}

export default ExpertProfile;
