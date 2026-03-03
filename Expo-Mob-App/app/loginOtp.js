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
  TextInput,
  Animated,
  Image,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginOtpScreen() {
  const slideAnim = useRef(new Animated.Value(120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef([]);

  const countries = [
    { code: "IN", callingCode: "91", flag: "🇮🇳", name: "India" },
    { code: "US", callingCode: "1", flag: "🇺🇸", name: "United States" },
    { code: "GB", callingCode: "44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "AE", callingCode: "971", flag: "🇦🇪", name: "UAE" },
    { code: "CA", callingCode: "1", flag: "🇨🇦", name: "Canada" },
  ];

  const [showPicker, setShowPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handlePhoneChange = (number) => {
    let cleaned = number.replace(/\D/g, "").slice(0, 10);
    setMobile(cleaned);
    setError(cleaned.length < 10 ? "Enter valid 10 digit number" : "");
  };

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setError("Enter valid 10 digit number");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      await API.post("/auth/send-otp", {
        mobile: `+${selectedCountry.callingCode}${mobile}`,
      });

      setOtpSent(true);
      setTimer(60);
      setIsTimerActive(true);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      setError("Failed to send OTP");
    }

    setLoading(false);
  };

  const handleOtpChange = (text, i) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[i] = text;
    setOtp(newOtp);

    if (text && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleKeyPress = (e, i) => {
    if (e.nativeEvent.key === "Backspace" && otp[i] === "" && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const resendOtp = async () => {
    try {
      await API.post("/auth/send-otp", {
        mobile: `+${selectedCountry.callingCode}${mobile}`,
      });

      setTimer(60);
      setIsTimerActive(true);
      setOtp(["", "", "", "", "", ""]);
      setError("");
    } catch {
      setError("Failed to resend OTP");
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        mobile: `+${selectedCountry.callingCode}${mobile}`,
        otp: finalOtp,
      });

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
      }

      // ✅ FIXED: Save full user object so dashboard can get userId/role
      if (res.data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // ✅ Redirect based on profile status
      if (res.data.redirectTo === "/dashboard") {
        router.replace("/(tabs)/dashboard/dashboard");
      } else {
        router.replace("/home/userProfile");
      }
    } catch {
      setError("OTP verification failed");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B2D72" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.topSection}>
              <Image
                source={require("../assets/img.png")}
                style={styles.logo}
              />
            </View>

            <View style={styles.card}>
              {!otpSent ? (
                <>
                  <Text style={styles.lab}>Welcome Back</Text>
                  <Text style={styles.label}>Enter Mobile Number</Text>

                  <View style={styles.phoneContainer}>
                    <TouchableOpacity
                      style={styles.flagButton}
                      onPress={() => setShowPicker(true)}
                    >
                      <Text style={styles.flagEmoji}>
                        {selectedCountry.flag}
                      </Text>
                      <Text style={styles.codeText}>
                        +{selectedCountry.callingCode}
                      </Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.mobileInput}
                      keyboardType="number-pad"
                      placeholder="Enter 10 digit number"
                      value={mobile}
                      onChangeText={handlePhoneChange}
                      maxLength={10}
                    />
                  </View>

                  <Modal visible={showPicker} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.flagModal}>
                        <Text style={styles.modalTitle}>
                          Select Country Code
                        </Text>

                        <FlatList
                          data={countries}
                          keyExtractor={(item) => item.code}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.flagRow}
                              onPress={() => {
                                setSelectedCountry(item);
                                setShowPicker(false);
                              }}
                            >
                              <Text style={styles.flagEmojiLarge}>
                                {item.flag}
                              </Text>
                              <Text style={styles.flagItemText}>
                                {item.name} (+{item.callingCode})
                              </Text>
                            </TouchableOpacity>
                          )}
                        />

                        <TouchableOpacity
                          onPress={() => setShowPicker(false)}
                          style={styles.closeBtn}
                        >
                          <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>

                  {error !== "" && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}

                  <TouchableOpacity
                    onPress={sendOtp}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryText}>
                      {loading ? "Sending..." : "Send OTP"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.infoText}>
                    By continuing, you agree to our{" "}
                    <Text style={styles.link}>Terms</Text> &{" "}
                    <Text style={styles.link}>Privacy Policy</Text>.
                  </Text>

                  <Text style={styles.safeText}>
                    🔒 Your number is safe with us
                  </Text>
                </>
              ) : (
                <Animated.View
                  style={{
                    opacity: opacityAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <Text style={styles.verifyTitle}>Verify Phone Number</Text>

                  <Text style={styles.subTitle}>
                    Enter the 6-digit OTP sent to your number
                  </Text>

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

                  {isTimerActive ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={resendOtp}>
                      <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={verifyOtp}
                  >
                    <Text style={styles.primaryText}>Verify</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topSection: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 180, height: 200, tintColor: "white" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },

  lab: { fontSize: 27, fontWeight: "800", color: "#0B2D72" },
  label: { marginTop: 10, fontSize: 14, fontWeight: "600" },

  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f4f8",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 55,
    marginTop: 12,
  },
  flagButton: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  flagEmoji: { fontSize: 26 },
  codeText: { marginLeft: 8, fontSize: 16 },
  mobileInput: { flex: 1, fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  flagModal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: "#0B2D72",
  },
  flagRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  flagEmojiLarge: { fontSize: 32 },
  flagItemText: { marginLeft: 12, fontSize: 18, color: "#333" },
  closeBtn: {
    marginTop: 15,
    alignSelf: "center",
  },
  closeText: {
    color: "#0B2D72",
    fontWeight: "bold",
    fontSize: 16,
  },

  errorText: { color: "red", marginTop: 8 },

  primaryButton: {
    backgroundColor: "#0B2D72",
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  infoText: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 12,
    color: "gray",
  },
  link: { color: "#0B2D72", fontWeight: "700" },
  safeText: {
    marginTop: 5,
    textAlign: "center",
    color: "#0B2D72",
    fontSize: 13,
  },

  verifyTitle: { textAlign: "center", fontSize: 20, fontWeight: "800" },
  subTitle: {
    textAlign: "center",
    fontSize: 13,
    color: "gray",
    marginTop: 5,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  otpDigit: {
    width: 50,
    height: 55,
    fontSize: 20,
    textAlign: "center",
    borderRadius: 12,
    backgroundColor: "#f2f4f8",
  },
  timerText: { textAlign: "center", marginTop: 10, color: "gray" },
  resendText: {
    textAlign: "center",
    marginTop: 10,
    color: "#0B2D72",
    fontWeight: "600",
  },
});