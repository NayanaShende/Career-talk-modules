import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TextInput,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CountryPicker from "react-native-country-picker-modal";
import { router } from "expo-router";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginOtpScreen() {
  const slideAnim = useRef(new Animated.Value(120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef([]);

  const [countryCode, setCountryCode] = useState("IN");
  const [callingCode, setCallingCode] = useState("91");

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ TIMER STATES
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // ✅ TIMER EFFECT
  useEffect(() => {
    let interval;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Handle phone input
  const handlePhoneChange = (number) => {
    let cleaned = number.replace(/\D/g, "").slice(0, 10);
    setMobile(cleaned);

    if (cleaned.length < 10) {
      setError("Enter valid 10 digit number");
    } else {
      setError("");
    }
  };

  // ✅ SEND OTP
  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setError("Enter valid 10 digit number");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      await API.post("/auth/send-otp", {
        mobile: `+${callingCode}${mobile}`,
      });

      setOtpSent(true);
      setTimer(60);
      setIsTimerActive(true);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      setError("Failed to send OTP");
    }

    setLoading(false);
  };

  // OTP input change
  const handleOtpChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // ✅ RESEND OTP
  const resendOtp = async () => {
    try {
      await API.post("/auth/send-otp", {
        mobile: `+${callingCode}${mobile}`,
      });

      setTimer(60);
      setIsTimerActive(true);
      setOtp(["", "", "", "", "", ""]);
      setError("");
    } catch {
      setError("Failed to resend OTP");
    }
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        mobile: `+${callingCode}${mobile}`,
        otp: finalOtp,
      });

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
      }

      router.replace("/home/userProfile");
    } catch (err) {
      setError("OTP verification failed");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* IMAGE */}
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
                }}
                style={styles.image}
              />
            </View>

            {/* CARD */}
            <View style={styles.card}>
              <Text style={styles.welcome}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to your account</Text>

              {/* PHONE INPUT */}
              <View style={styles.phoneContainer}>
                <CountryPicker
                  countryCode={countryCode}
                  withFlag
                  withCallingCode
                  withFilter
                  onSelect={(country) => {
                    setCountryCode(country.cca2);
                    setCallingCode(country.callingCode[0]);
                  }}
                />
                <Text style={styles.code}>+{callingCode}</Text>

                <TextInput
                  style={styles.mobileInput}
                  keyboardType="number-pad"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChangeText={handlePhoneChange}
                  maxLength={10}
                />
              </View>

              {error !== "" && <Text style={styles.errorText}>{error}</Text>}

              {!otpSent && (
                <TouchableOpacity
                  onPress={sendOtp}
                  style={styles.loginButton}
                  disabled={loading}
                >
                  <Text style={styles.loginText}>
                    {loading ? "Sending..." : "Login"}
                  </Text>
                </TouchableOpacity>
              )}

              {otpSent && (
                <Animated.View
                  style={[
                    styles.otpBox,
                    {
                      opacity: opacityAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <Text style={styles.otpTitle}>Enter OTP</Text>

                  <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => (otpRefs.current[i] = ref)}
                        style={styles.otpDigit}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                      />
                    ))}
                  </View>

                  {/* TIMER / RESEND */}
                  {isTimerActive ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={resendOtp}>
                      <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={verifyOtp}
                  >
                    <Text style={styles.loginText}>Verify OTP</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageContainer: { height: 280, width: "100%" },
  image: { width: "100%", height: "100%" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -40,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
  },

  welcome: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1e2a78",
  },

  subtitle: {
    marginBottom: 25,
    fontSize: 16,
    fontWeight: "600",
  },

  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 55,
  },

  code: {
    fontSize: 16,
    marginHorizontal: 6,
    fontWeight: "600",
  },

  mobileInput: {
    flex: 1,
    fontSize: 16,
  },

  loginButton: {
    backgroundColor: "#1C4D8D",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    height: 56,
    width: "100%",
    elevation: 4,
  },

  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },

  otpBox: {
    marginTop: 20,
    width: "100%",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  otpDigit: {
    width: 45,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#f1f3f6",
    textAlign: "center",
    fontSize: 20,
  },

  otpTitle: {
    fontWeight: "600",
  },

  timerText: {
    textAlign: "center",
    marginTop: 10,
    color: "gray",
  },

  resendText: {
    textAlign: "center",
    marginTop: 10,
    color: "#1C4D8D",
    fontWeight: "600",
  },

  errorText: {
    color: "red",
    marginTop: 6,
  },
});
