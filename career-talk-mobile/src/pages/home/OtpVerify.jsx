import React, { useState, useEffect } from "react";
import "./OtpVerify.css";
import otpIcon from "../../assets/home/otp.png";
import axiosInstance from "../../utils/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";

const normalize = (m) => m.replace(/\D/g, "").slice(-10);

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mobile = location.state?.mobile || localStorage.getItem("tempPhone");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes timer

  // Redirect if no mobile number found
  useEffect(() => {
    if (!mobile) {
      alert("Mobile number missing. Please login again.");
      navigate("/");
    }
  }, [mobile, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5)
      document.getElementById(`otp-${index + 1}`)?.focus();
  };

 const handleVerify = async () => {
   const otpString = otp.join("");

   if (otpString.length !== 6) {
     alert("Please enter all 6 digits");
     return;
   }

   try {
     const res = await axiosInstance.post("/auth/verify-otp", {
       mobile: normalize(mobile),
       otp: otpString,
     });

     if (!res.data.success) {
       alert(res.data.message || "Invalid OTP");
       return;
     }

     // Save token
     localStorage.setItem("token", res.data.token);

     // Get backend redirect
     const redirectTo = res.data.redirectTo;

     if (!redirectTo) {
       alert("Something went wrong: no redirect provided.");
       return;
     }

     navigate(redirectTo);
   } catch (err) {
     console.error("OTP VERIFY ERROR:", err);
     alert("OTP verification failed. Try again.");
   }
 };


  return (
    <div className="otp-container">
      <div className="otp-card">
        <img
          src={otpIcon}
          alt="OTP Icon"
          className="otp-icon"
          onError={(e) => (e.target.style.display = "none")}
        />
        <p className="text">Enter the 6-digit OTP sent to: {mobile}</p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              className="otp-box"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onFocus={(e) => e.target.select()}
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
