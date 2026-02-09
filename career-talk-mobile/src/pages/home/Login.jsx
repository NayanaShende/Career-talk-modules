import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
const normalize = (m) => m.replace(/\D/g, "").slice(-10);



const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [dial, setDial] = useState("91");

  useEffect(() => {
    const input = document.getElementById("phoneInput");
    if (!input) return;

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
    const normalizedPhone = normalize(fullPhone); // ⭐ FIX

    try {
      const { data } = await axiosInstance.post("/auth/send-otp", {
        mobile: normalizedPhone, // ⭐ SEND ONLY LAST 10 DIGITS
      });

      if (data.success) {
        localStorage.setItem("tempPhone", normalizedPhone); // ⭐ STORE FIXED NUMBER
        navigate("/verify-otp", { state: { mobile: normalizedPhone } });
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Backend Not Connected");
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
      </div>
    </div>
  );
};

export default Login;
