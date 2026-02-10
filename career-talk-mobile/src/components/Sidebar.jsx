import { Link } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Career Talk Dashboard</h2>

      <nav>
        <Link to="/" className="menu-item">
        Search Experts
        </Link>

        <Link to="/recommended" className="menu-item">
        Top Experts
        </Link>
        
        <Link to="/profile" className="menu-item">
          Profile 
        </Link>
        
        <Link to="/search-experts" className="menu-item">
          Search Experts
        </Link>

        <Link to="/recommended-experts" className="menu-item">
        Top Experts
        </Link>

      </nav>
    </div>
  );
}

export default Sidebar;
