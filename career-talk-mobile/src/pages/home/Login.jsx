import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("91"); // default India

  useEffect(() => {
    const input = document.querySelector("#phoneInput");
    if (window.intlTelInput) {
      const iti = window.intlTelInput(input, {
        initialCountry: "in",
        separateDialCode: true,
      });

      input.addEventListener("countrychange", () => {
        setSelectedCountry(iti.getSelectedCountryData().dialCode);
      });
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      alert("Enter a valid mobile number");
      return;
    }

    const fullNumber = "+" + selectedCountry + phone;
    console.log("Phone number used:", fullNumber);

    try {
      const { data } = await axiosInstance.post("/auth/send-otp", {
        mobile: fullNumber,
      });

      console.log("Server Response:", data);

      if (data.success) {
        localStorage.setItem("tempPhone", fullNumber);
        navigate("/verify-otp");
      } else {
        alert(data.message || "OTP sending failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Backend not connected!");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="welcome-text">WELCOME</h1>
        <h2 className="log">Log-In</h2>

        <input
          id="phoneInput"
          type="tel"
          className="mobile-input"
          placeholder="Enter Mobile Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button type="button" className="send-btn" onClick={handleSendOtp}>
          Send OTP
        </button>

        <h2 className="register-text">Register</h2>
      </div>
    </div>
  );
};

export default Login;
