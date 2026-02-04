import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/home/Login";
import OtpVerify from "./pages/home/OtpVerify";
import RoleSelection from "./pages/home/RoleSelection";
import JobseekerPage from "./pages/home/JobseekerPage";
import ExpertPage from "./pages/home/ExpertPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/jobseeker" element={<JobseekerPage />} />
        <Route path="/expert" element={<ExpertPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
