import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/home/Login";
import OtpVerify from "./pages/home/OtpVerify";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
