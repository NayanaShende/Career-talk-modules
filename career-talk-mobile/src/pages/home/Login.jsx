import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [dial, setDial] = useState("91");

  useEffect(() => {
    const input = document.querySelector("#phoneInput");

    const wait = setInterval(() => {
      if (window.intlTelInput) {
        clearInterval(wait);

        const iti = window.intlTelInput(input, {
          initialCountry: "in",
          separateDialCode: true,
          utilsScript:
            "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
        });

        input.addEventListener("countrychange", () => {
          const data = iti.getSelectedCountryData();
          setDial(data.dialCode);
        });
      }
    }, 200);
  }, []);

  const sendOtp = async () => {
    if (phone.length < 10) {
      alert("Enter valid phone number");
      return;
    }

    const fullPhone = "+" + dial + phone;
    console.log("Sending OTP to:", fullPhone);

    try {
      const { data } = await axiosInstance.post("/auth/send-otp", {
        mobile: fullPhone,
      });

      console.log("API Response:", data);

      if (data.success) {
        localStorage.setItem("tempPhone", fullPhone);
        alert("OTP Sent Successfully!");
        navigate("/verify-otp");
      } else {
        alert(data.message || "OTP sending failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Backend Not Connected!");
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
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="send-btn" onClick={sendOtp}>
          Send OTP
        </button>

        <h2 className="register-text">Register</h2>
      </div>
    </div>
  );
};

export default Login;
