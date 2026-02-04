import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Employee Home</h1>
        <p>
          Welcome! From here you can manage expert onboarding and availability.
        </p>

        <button onClick={() => navigate("/expert")}>
          Go to Expert Onboarding
        </button>
      </div>
    </div>
  );
};

export default Home;
