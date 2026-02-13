import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axiosInstance from "../src/services/api";

export default function OtpVerify() {
  const { mobile } = useLocalSearchParams();
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "OTP must be 6 digits");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        mobile,
        otp,
      });

      const data = response.data;

      if (data.success) {
        // Redirect to role selection screen
        router.replace("/home/roleSelection");
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err.response?.data || err.message);
      Alert.alert("Error", "Backend not connected or invalid URL");
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Sent to: {mobile}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit OTP"
          keyboardType="numeric"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity style={styles.button} onPress={verifyOtp}>
          <Text style={styles.buttonText}>Verify OTP</Text>
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
