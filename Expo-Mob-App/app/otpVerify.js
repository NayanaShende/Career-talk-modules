import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axiosInstance from "../services/api";
import { LinearGradient } from "expo-linear-gradient";

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

      if (response.data.success) {
        router.replace("/home/roleSelection");
      } else {
        Alert.alert("Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Backend not connected");
    }
  };

  return (
    <LinearGradient
      colors={["#0c69ff", "#fffef7", "#5b9cff"]}
      style={{ flex: 1 }}
    >
      {/* Background Wave */}
      {/* <Image
        source={require("../assets/bg-wave.png")}
        style={styles.bgImage}
        resizeMode="cover"
      /> */}

      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          {/* Illustration */}
          <Image
            source={require("../assets/otp.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>Code sent to</Text>
          <Text style={styles.mobile}>{mobile}</Text>

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

          <Text style={styles.resend}>Didn't receive code? Resend</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bgImage: {
    position: "absolute",
    width: "120%",
    height: "100%",
  },

  card: {
    width: "90%",
    backgroundColor: "#ffffffee",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },

  image: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e2a78",
  },

  subtitle: {
    fontSize: 14,
    color: "#50565b",
    marginTop: 4,
  },

  mobile: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f5cff",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d0d7ff",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 8,
    backgroundColor: "#fff",
  },

  button: {
    width: "100%",
    backgroundColor: "#2f5cff",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  resend: {
    marginTop: 18,
    color: "#6c757d",
    fontSize: 13,
  },
});
