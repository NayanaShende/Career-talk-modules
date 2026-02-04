import { Link } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Career Talk</h2>

      <nav>
        <Link to="/" className="menu-item">
          🔍 Search Experts
        </Link>

        <Link to="/recommended" className="menu-item">
          ⭐ Recommended Experts
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
