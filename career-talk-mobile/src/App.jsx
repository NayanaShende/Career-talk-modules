import { Routes, Route } from "react-router-dom";
import "./App.css";

// Home Pages
import Login from "./pages/home/Login";
import OtpVerify from "./pages/home/OtpVerify";
import RoleSelection from "./pages/home/RoleSelection";
import JobseekerPage from "./pages/home/JobseekerPage";
import ExpertPage from "./pages/home/ExpertPage";
import ProtectedRoute from "./pages/home/ProtectedRoute";
import Dashboard from "./pages/home/Dashboard";

// Expert Pages
import Sidebar from "./components/dashboard/Sidebar";
import SearchExperts from "./pages/expert/SearchExperts";
import RecommendedExperts from "./pages/expert/RecommendedExperts";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExperts from "./pages/admin/AdminExperts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";

// ================= LAYOUT =================
const ExpertLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">{children}</div>
    </div>
  );
};

// ================= APP =================
export default function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<OtpVerify />} />
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/jobseeker" element={<JobseekerPage />} />
      <Route path="/expert" element={<ExpertPage />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Expert Routes with Sidebar */}
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

      {/* ─── Admin Routes ─── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/experts" element={<AdminExperts />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/payments" element={<AdminPayments />} />

    </Routes>
  );
}
