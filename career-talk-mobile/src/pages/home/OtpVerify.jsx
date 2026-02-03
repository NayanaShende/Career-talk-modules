import React, { useState, useEffect } from "react";
import "./OtpVerify.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const OtpVerify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(0);
  const phone = localStorage.getItem("tempPhone");

  useEffect(() => {
    if (!phone) {
      alert("Phone number missing. Please login again.");
      navigate("/");
    } else {
      setTimeLeft(5 * 60);
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    let updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }

    try {
      const { data } = await axiosInstance.post("/auth/verify-otp", {
        mobile: phone,
        otp: finalOtp,
      });

      if (data.success) {
        alert("OTP Verified Successfully!");
        localStorage.removeItem("tempPhone");
        navigate("/select-role");
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2 className="heading">Verify OTP</h2>
        <p className="text">Enter the 6-digit OTP sent to: {phone}</p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              maxLength="1"
              className="otp-box"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
            />
          ))}
        </div>

        {timeLeft > 0 ? (
          <p className="otp-timer">Expires in: {formatTime(timeLeft)}</p>
        ) : (
          <p className="otp-timer expired">OTP Expired! Please resend.</p>
        )}

        <button
          className="verify-btn"
          onClick={handleVerify}
          disabled={timeLeft <= 0}
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerify;
