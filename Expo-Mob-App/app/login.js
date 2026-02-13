import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>WELCOME</Text>

        <PhoneInput
          ref={phoneInput}
          initialCountry="in"
          textProps={{ placeholder: "Enter phone number" }}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={sendOtp}
          style={styles.button}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Send OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#777",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
