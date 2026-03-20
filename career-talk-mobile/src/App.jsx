import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/home/Login";
import OtpVerify from "./pages/home/OtpVerify";
import RoleSelection from "./pages/home/RoleSelection";
import JobseekerPage from "./pages/home/JobseekerPage";
import ExpertPage from "./pages/home/ExpertPage";
import ProtectedRoute from "./pages/home/ProtectedRoute";
import Dashboard from "./pages/home/Dashboard";
import Admin from "./pages/home/Admin";

import Sidebar from "./components/dashboard/Sidebar";
import SearchExperts from "./pages/expert/SearchExperts";
import RecommendedExperts from "./pages/expert/RecommendedExperts";

const ExpertLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">{children}</div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<OtpVerify />} />
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/jobseeker" element={<JobseekerPage />} />
      <Route path="/expert" element={<ExpertPage />} />
      <Route path="/admin" element={<Admin />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

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
  );
}