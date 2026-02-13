<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import Home from "./pages/dashboard/home";
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Home Pages
import Login from "./pages/home/Login";
import OtpVerify from "./pages/home/OtpVerify";
import RoleSelection from "./pages/home/RoleSelection";
import JobseekerPage from "./pages/home/JobseekerPage";
import ExpertPage from "./pages/home/ExpertPage";
import ProtectedRoute from "./pages/home/ProtectedRoute";
import Dashboard from "./pages/home/Dashboard"; // adjust path

// Expert Pages
import Sidebar from "./components/Sidebar";
>>>>>>> origin/Mob_app
import SearchExperts from "./pages/expert/SearchExperts";
import RecommendedExperts from "./pages/expert/RecommendedExperts";
import Sidebar from "./components/dashboard/Sidebar";
import "./App.css";

<<<<<<< HEAD

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
=======
const ExpertLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/jobseeker" element={<JobseekerPage />} />
        <Route path="/expert" element={<ExpertPage />} />

        {/* Protected Home Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Expert Sidebar Routes */}
        <Route
          path="/search-expert"
          element={
            <ExpertLayout>
              <SearchExperts />
            </ExpertLayout>
          }
        />
        <Route
          path="/recommended"
          element={
            <ExpertLayout>
              <RecommendedExperts />
            </ExpertLayout>
          }
        />
      </Routes>
    </BrowserRouter>
>>>>>>> origin/Mob_app
  );
}