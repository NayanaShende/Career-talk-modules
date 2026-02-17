import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axiosInstance from "../services/api";
import { LinearGradient } from "expo-linear-gradient";

export default function OtpVerify() {
  const { mobile } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/auth/verify-otp", {
        mobile,
        otp,
      });

      setLoading(false);

      if (response?.data?.success || response?.data?.token || response.status === 200) {
        router.replace("/home/roleSelection");
      } else {
        Alert.alert("Invalid OTP");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert(
        "OTP verification failed",
        err?.response?.data?.message || "Backend error"
      );
    }
  };

  return (
    <LinearGradient colors={["#0c69ff", "#fffef7", "#5b9cff"]} style={{ flex: 1 }}>
      
      <SafeAreaView style={{ flex: 1 }}>
        
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              
              <View style={styles.card}>

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

                <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={verifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.resend}>Didn't receive code? Resend</Text>

              </View>

            </ScrollView>

          </TouchableWithoutFeedback>

        </KeyboardAvoidingView>

      </SafeAreaView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    alignItems: "center",
  },

  image: {
    width: 180,
    height: 140,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0c69ff",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },

  mobile: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 18,
  },

  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#e3e8ff",
    backgroundColor: "#f7f9ff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 18,
  },

  button: {
    width: "100%",
    backgroundColor: "#0c69ff",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  resend: {
    marginTop: 18,
    color: "#0c69ff",
    fontWeight: "600",
  },
});
