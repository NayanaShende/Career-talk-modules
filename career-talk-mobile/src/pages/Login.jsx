import React, { useEffect, useState } from "react";
import "./Login.css";
import imgImage from "../assets/img.jpg";
import OtpInput from "../components/OtpInput";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false); // controls OTP input visibility
  const [otp, setOtp] = useState(""); // stores user entered OTP

  useEffect(() => {
    const input = document.querySelector("#phoneInput");
    if (window.intlTelInput) {
      window.intlTelInput(input, {
        initialCountry: "in",
        separateDialCode: true,
      });
    }
  }, []);

  // Send OTP
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      alert("Please enter a valid mobile number");
      return;
    }

    try {
      const API = "http://localhost:3000";

      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP sent!");
        setOtpSent(true); // ✅ show OTP input block
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Server error / API not connected");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      alert("Please enter OTP");
      return;
    }

    try {
      const API = "http://localhost:3000";

      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, otp }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP verified! Login successful.");
        // You can navigate to dashboard here if needed
        // navigate("/dashboard");
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Server error / API not connected");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="welcome-text">WELCOME</h1>
        <h2 className="log">Log-In</h2>

        {!otpSent && (
          <>
            <input
              id="phoneInput"
              type="tel"
              className="mobile-input"
              placeholder="Enter Mobile Number"
              onChange={(e) => setPhone(e.target.value)}
            />
            <button className="send-btn" onClick={handleSendOtp}>
              Send OTP
            </button>
          </>
        )}

        {otpSent && (
          <div className="otp-block">
            <OtpInput value={otp} onChange={setOtp} />
            <button className="send-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </div>
        )}

        <h2 className="register-text">Register</h2>
      </div>
    </div>
  );
};

export default Login;
