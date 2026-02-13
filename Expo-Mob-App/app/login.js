import { useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PhoneInput from "react-native-phone-input";
import axios from "axios";
import { router } from "expo-router";

export default function LoginScreen() {
  const phoneInput = useRef(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    const number = phoneInput.current?.getValue();

    if (!number || number.length < 8) {
      alert("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      // 👇 ADD YOUR IP HERE
const API_URL = "http://192.168.1.22:3000/api/auth/send-otp";

      const res = await axios.post(API_URL, {
        mobile: number,
      });

      console.log("OTP Sent:", res.data);

      alert("OTP Sent Successfully!");

      router.push({
        pathname: "/otpVerify",
        params: { mobile: number },
      });
    } catch (err) {
      console.log("OTP ERROR:", err);
      alert("Failed to send OTP. Backend may not be running.");
    }

    setLoading(false);
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        WELCOME
      </Text>

      <PhoneInput
        ref={phoneInput}
        initialCountry="in"
        textProps={{ placeholder: "Enter phone number" }}
        style={{
          marginVertical: 20,
          padding: 15,
          borderWidth: 1,
          borderRadius: 10,
        }}
      />

      <TouchableOpacity
        onPress={sendOtp}
        style={{
          backgroundColor: "blue",
          padding: 15,
          borderRadius: 10,
        }}
        disabled={loading}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {loading ? "Sending..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
