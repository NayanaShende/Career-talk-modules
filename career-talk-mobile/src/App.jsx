import { Routes, Route } from "react-router-dom";
import Home from "./pages/dashboard/home";
import SearchExperts from "./pages/expert/SearchExperts";
import RecommendedExperts from "./pages/expert/RecommendedExperts";
import Sidebar from "./components/dashboard/Sidebar";
import "./App.css";


export default function App() {
  return (
    <div className="dashboard-layout">

      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* RIGHT CONTENT */}
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchExperts />} />
          <Route path="/recommended" element={<RecommendedExperts />} />
        </Routes>
      </div>
    </div>
  );
}