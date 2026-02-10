import { Link } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Career Talk Dashboard</h2>

      <nav>
        <Link to="/" className="menu-item">Home</Link>

        <Link to="/search" className="menu-item">Search Experts</Link>

        <Link to="/recommended" className="menu-item">Top Experts</Link>

        <Link to="/expertprofile" className="menu-item">Expert Profile</Link>
        
      </nav>
    </div>
  );
}

export default Sidebar;
