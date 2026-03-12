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
  const slideAnim = useRef(new Animated.Value(30)).current;
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
    setError(
      cleaned.length > 0 && cleaned.length < 10
        ? "Enter a valid 10-digit number"
        : "",
    );
  };

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setError("Enter a valid 10-digit number");
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
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      setError("Failed to send OTP. Please try again.");
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
      setError("Failed to resend OTP.");
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", {
        mobile: `+${selectedCountry.callingCode}${mobile}`,
        otp: finalOtp,
      });
      if (res.data.token) await AsyncStorage.setItem("token", res.data.token);
      if (res.data.user) {
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            ...res.data.user,
            redirectTo: res.data.redirectTo,
          }),
        );
      }
      if (res.data.redirectTo === "/dashboard") {
        router.replace("/(tabs)/dashboard/dashboard");
      } else {
        router.replace("/home/userProfile");
      }
    } catch {
      setError("OTP verification failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.root}>
            {/* ── TOP BRAND AREA ── */}
            <View style={styles.brandArea}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../assets/img.png")}
                  style={styles.logo}
                />
              </View>
              <Text style={styles.appName}>CareerTalk</Text>
              <Text style={styles.tagline}>
                Connect with experts. Grow your career.
              </Text>
            </View>

            {/* ── FORM CARD ── */}
            <View style={styles.card}>
              {!otpSent ? (
                <>
                  <Text style={styles.cardTitle}>Sign In</Text>
                  <Text style={styles.cardSubtitle}>
                    Enter your mobile number to continue
                  </Text>

                  {/* Phone input */}
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <View
                    style={[
                      styles.phoneRow,
                      error && mobile.length > 0 && styles.inputRowError,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.flagBtn}
                      onPress={() => setShowPicker(true)}
                    >
                      <Text style={styles.flagEmoji}>
                        {selectedCountry.flag}
                      </Text>
                      <Text style={styles.callingCode}>
                        +{selectedCountry.callingCode}
                      </Text>
                      <Text style={styles.chevron}>▾</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TextInput
                      style={styles.phoneInput}
                      keyboardType="number-pad"
                      placeholder="10-digit number"
                      placeholderTextColor="#B0B8C1"
                      value={mobile}
                      onChangeText={handlePhoneChange}
                      maxLength={10}
                    />
                  </View>

                  {error !== "" && (
                    <View style={styles.errorRow}>
                      <Text style={styles.errorDot}>●</Text>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      loading && styles.primaryBtnDisabled,
                    ]}
                    onPress={sendOtp}
                    disabled={loading}
                  >
                    <Text style={styles.primaryBtnText}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.termsText}>
                    By continuing, you agree to our{" "}
                    <Text style={styles.termsLink}>Terms of Use</Text> &amp;{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </>
              ) : (
                <Animated.View
                  style={{
                    opacity: opacityAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <Text style={styles.cardTitle}>Verify OTP</Text>
                  <Text style={styles.cardSubtitle}>
                    6-digit code sent to{" "}
                    <Text style={styles.boldPhone}>
                      +{selectedCountry.callingCode} {mobile}
                    </Text>
                  </Text>

                  {/* OTP boxes */}
                  <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => (otpRefs.current[i] = ref)}
                        style={[
                          styles.otpBox,
                          digit !== "" && styles.otpBoxFilled,
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                      />
                    ))}
                  </View>

                  {error !== "" && (
                    <View style={styles.errorRow}>
                      <Text style={styles.errorDot}>●</Text>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  {/* Timer / Resend */}
                  <View style={styles.resendRow}>
                    {isTimerActive ? (
                      <Text style={styles.timerText}>
                        Resend code in{" "}
                        <Text style={styles.timerCount}>{timer}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={resendOtp}>
                        <Text style={styles.resendText}>
                          Didn't receive it? Resend OTP
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      loading && styles.primaryBtnDisabled,
                    ]}
                    onPress={verifyOtp}
                    disabled={loading}
                  >
                    <Text style={styles.primaryBtnText}>
                      {loading ? "Verifying..." : "Verify & Continue"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                      setOtpSent(false);
                      setOtp(["", "", "", "", "", ""]);
                      setError("");
                    }}
                  >
                    <Text style={styles.backBtnText}>← Change number</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>

            {/* ── COUNTRY PICKER MODAL ── */}
            <Modal visible={showPicker} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>Select Country</Text>
                  <FlatList
                    data={countries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.countryRow,
                          selectedCountry.code === item.code &&
                            styles.countryRowSelected,
                        ]}
                        onPress={() => {
                          setSelectedCountry(item);
                          setShowPicker(false);
                        }}
                      >
                        <Text style={styles.countryFlag}>{item.flag}</Text>
                        <Text style={styles.countryName}>{item.name}</Text>
                        <Text style={styles.countryCode}>
                          +{item.callingCode}
                        </Text>
                        {selectedCountry.code === item.code && (
                          <Text style={styles.checkMark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const NAV = "#0B2D72";
const ACCENT = "#C5A059";
const BG = "#F4F6FB";
const CARD = "#FFFFFF";
const TEXT = "#1A2340";
const MUTED = "#7A8499";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAV },
  root: { flex: 1, backgroundColor: NAV },

  // ── Brand area ──
  brandArea: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: { width: 44, height: 44, tintColor: "#fff" },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // ── Card ──
  card: {
    flex: 1,
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 24,
    lineHeight: 20,
  },
  boldPhone: { fontWeight: "700", color: TEXT },

  // ── Input label ──
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
    marginBottom: 8,
  },

  // ── Phone row ──
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E3E8F0",
    height: 54,
    paddingHorizontal: 14,
  },
  inputRowError: { borderColor: "#E53935" },
  flagBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  flagEmoji: { fontSize: 22 },
  callingCode: { fontSize: 15, fontWeight: "600", color: TEXT, marginLeft: 4 },
  chevron: { fontSize: 11, color: MUTED, marginLeft: 2 },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: "#E3E8F0",
    marginHorizontal: 12,
  },
  phoneInput: { flex: 1, fontSize: 16, color: TEXT },

  // ── Error ──
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  errorDot: { fontSize: 8, color: "#E53935" },
  errorText: { fontSize: 13, color: "#E53935" },

  // ── Primary button ──
  primaryBtn: {
    backgroundColor: NAV,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Terms ──
  termsText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },
  termsLink: { color: NAV, fontWeight: "600" },

  // ── OTP ──
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  otpBox: {
    width: 48,
    height: 54,
    borderRadius: 10,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: "#E3E8F0",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: TEXT,
  },
  otpBoxFilled: { borderColor: NAV, backgroundColor: "#EEF2FB" },

  // ── Resend ──
  resendRow: { alignItems: "center", marginTop: 14 },
  timerText: { fontSize: 13, color: MUTED },
  timerCount: { fontWeight: "700", color: NAV },
  resendText: { fontSize: 13, color: NAV, fontWeight: "600" },

  // ── Back ──
  backBtn: { alignItems: "center", marginTop: 16 },
  backBtnText: { fontSize: 13, color: MUTED, fontWeight: "500" },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDE2ED",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 14,
    textAlign: "center",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 10,
  },
  countryRowSelected: { backgroundColor: "#EEF2FB" },
  countryFlag: { fontSize: 26 },
  countryName: { flex: 1, fontSize: 15, color: TEXT, fontWeight: "500" },
  countryCode: { fontSize: 14, color: MUTED, fontWeight: "600" },
  checkMark: { fontSize: 16, color: NAV, fontWeight: "700" },
  modalCancelBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: TEXT },
});
