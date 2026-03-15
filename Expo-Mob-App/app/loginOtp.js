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
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Path, Line } from "react-native-svg";
import { router } from "expo-router";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// ─── CareerTalk Briefcase Logo ────────────────────────────────────────────────
function CareerTalkLogo() {
  return (
    <View style={styles.logoBox}>
      <Svg width={24} height={24} viewBox="0 0 26 26" fill="none">
        {/* Briefcase body */}
        <Rect
          x={3}
          y={10}
          width={20}
          height={13}
          rx={3}
          fill="rgba(255,255,255,0.15)"
          stroke="white"
          strokeWidth={1.6}
        />
        {/* Briefcase handle */}
        <Path
          d="M9 10V8a4 4 0 018 0v2"
          stroke="white"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        {/* Center divider */}
        <Line
          x1={13}
          y1={10}
          x2={13}
          y2={23}
          stroke="white"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
        {/* Upward arrow — growth */}
        <Path
          d="M10 16l3-3 3 3"
          stroke="white"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginOtpScreen() {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const otpRefs = useRef([]);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

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

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handlePhoneChange = (number) => {
    const cleaned = number.replace(/\D/g, "").slice(0, 10);
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
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 55,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 55,
          friction: 8,
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
      if (res.data.user)
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ ...res.data.user, redirectTo: res.data.redirectTo }),
        );
      if (res.data.redirectTo === "/dashboard")
        router.replace("/(tabs)/dashboard/dashboard");
      else router.replace("/home/userProfile");
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
          <Animated.View
            style={[
              styles.root,
              { opacity: fadeIn, transform: [{ translateY: slideUp }] },
            ]}
          >
            {/* ── TOP LAVENDER SECTION ── */}
            <View style={styles.top}>
              {/* Logo */}
              <View style={styles.logoRow}>
                <CareerTalkLogo />
                <View>
                  <Text style={styles.appName}>CareerTalk</Text>
                </View>
              </View>

              {/* Headline */}
              <Text style={styles.headline}>
                Find your direction{"\n"}
                <Text style={styles.headlineAccent}>
                  Build your future
                </Text>
              </Text>

              <Text style={styles.subline}>
                One conversation with the right expert can change your entire
                career path.
              </Text>
            </View>

            {/* ── WHITE FORM CARD ── */}
            <View style={styles.formCard}>
              {!otpSent ? (
                <>
                  <Text style={styles.sectionLabel}>
                    SIGN IN TO GET STARTED
                  </Text>

                  {/* Phone row */}
                  <View
                    style={[
                      styles.phoneRow,
                      error && mobile.length > 0 && styles.phoneRowErr,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.countryBtn}
                      onPress={() => setShowPicker(true)}
                    >
                      <Text style={styles.flagEmoji}>
                        {selectedCountry.flag}
                      </Text>
                      <Text style={styles.dialCode}>
                        +{selectedCountry.callingCode}
                      </Text>
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.divLine} />
                    <TextInput
                      style={styles.numInput}
                      keyboardType="number-pad"
                      placeholder="Enter mobile number"
                      placeholderTextColor="#BBBFC8"
                      value={mobile}
                      onChangeText={handlePhoneChange}
                      maxLength={10}
                    />
                  </View>

                  {error !== "" && (
                    <Text style={styles.errText}>⚠ {error}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.ctaBtn, loading && styles.ctaBtnDim]}
                    onPress={sendOtp}
                    disabled={loading}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.ctaBtnText}>
                      {loading ? "Sending…" : "Send OTP"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.legalText}>
                    By continuing you agree to our{" "}
                    <Text style={styles.legalLink}>Terms</Text> &{" "}
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                  </Text>

                  {/* FAB */}
                  <TouchableOpacity style={styles.fab} onPress={sendOtp}>
                    <Text style={styles.fabArrow}>→</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Animated.View
                  style={{
                    opacity: opacityAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim },
                    ],
                  }}
                >
                  <Text style={styles.sectionLabel}>VERIFY YOUR NUMBER</Text>
                  <Text style={styles.formSub}>
                    Code sent to{" "}
                    <Text style={styles.numHighlight}>
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
                          styles.otpCell,
                          digit !== "" && styles.otpCellFilled,
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
                    <Text style={styles.errText}>⚠ {error}</Text>
                  )}

                  <View style={styles.resendRow}>
                    {isTimerActive ? (
                      <Text style={styles.timerText}>
                        Resend code in{" "}
                        <Text style={styles.timerHighlight}>{timer}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={resendOtp}>
                        <Text style={styles.resendText}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.ctaBtn, loading && styles.ctaBtnDim]}
                    onPress={verifyOtp}
                    disabled={loading}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.ctaBtnText}>
                      {loading ? "Verifying…" : "Verify & Continue"}
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
                <View style={styles.modalSheet}>
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
                            styles.countryRowActive,
                        ]}
                        onPress={() => {
                          setSelectedCountry(item);
                          setShowPicker(false);
                        }}
                      >
                        <Text style={styles.cFlag}>{item.flag}</Text>
                        <Text style={styles.cName}>{item.name}</Text>
                        <Text style={styles.cCode}>+{item.callingCode}</Text>
                        {selectedCountry.code === item.code && (
                          <View style={styles.checkCircle}>
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 11,
                                fontWeight: "800",
                              }}
                            >
                              ✓
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const PURPLE = "rgb(113, 149, 255)";
const PURPLE_LIGHT = "#c2d6fd";
const PURPLE_PALE = "#cedfff";
const WHITE = "#FFFFFF";
const INK = "#1C1A2E";
const MUTED = "#79808d";
const MUTED2 = "#575a6a";
const BORDER = "#E0DCEF";
const BORDER2 = "#E8E4F4";
const BG_INPUT = "#F8F8FC";
const ERR = "#DC2626";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PURPLE_LIGHT },
  root: { flex: 1, backgroundColor: PURPLE_LIGHT },

  // ── top section ──
  top: {
    flex: 1,

    paddingHorizontal: 24,
    paddingTop: 12,
    justifyContent: "center",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
  },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 37,
    fontWeight: "800",
    color: INK,
    letterSpacing: -0.3,
  },
  appTagline: {
    fontSize: 10,
    color: PURPLE,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 1,
  },

  headline: {
    fontSize: 30,
    fontWeight: "700",
    color: INK,
    lineHeight: 38,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  headlineAccent: {
    color: PURPLE,
    fontSize: 30,
    fontWeight: "700",
  },
  subline: {
    fontSize: 14,
    color: MUTED2,
    lineHeight: 22,
    marginBottom: 28,
  },

  // stat cards
  statRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  statNum: { fontSize: 17, fontWeight: "700", color: INK },
  statLabel: { fontSize: 10, color: MUTED, marginTop: 3, fontWeight: "500" },

  // ── form card ──
  formCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    marginTop: -80, // 👈 ADD THIS (adjust value if needed)
    borderTopWidth: 0.5,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: PURPLE,
    letterSpacing: 1.2,
    marginBottom: 18,
  },
  formSub: { fontSize: 13, color: MUTED, marginBottom: 22, lineHeight: 20 },
  numHighlight: { fontWeight: "700", color: PURPLE },

  // phone input
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_INPUT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER2,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  phoneRowErr: { borderColor: ERR },
  countryBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  flagEmoji: { fontSize: 20 },
  dialCode: { fontSize: 14, fontWeight: "600", color: INK, marginLeft: 4 },
  chevron: { fontSize: 18, color: MUTED, fontWeight: "300", marginLeft: 2 },
  divLine: {
    width: 1,
    height: 24,
    backgroundColor: BORDER2,
    marginHorizontal: 14,
  },
  numInput: { flex: 1, fontSize: 15, color: INK, fontWeight: "500" },

  errText: {
    fontSize: 12,
    color: ERR,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 2,
  },

  // CTA button
  ctaBtn: {
    backgroundColor: PURPLE,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 7,
  },
  ctaBtnDim: { opacity: 0.65 },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.2,
  },

  legalText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 11.5,
    color: MUTED,
    lineHeight: 18,
  },
  legalLink: { color: PURPLE, fontWeight: "700" },

  // FAB
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: INK,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  fabArrow: { color: WHITE, fontSize: 18, fontWeight: "600" },

  // OTP
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  otpCell: {
    flex: 1,
    height: 54,
    borderRadius: 13,
    backgroundColor: BG_INPUT,
    borderWidth: 1.5,
    borderColor: BORDER2,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: INK,
  },
  otpCellFilled: {
    borderColor: PURPLE,
    backgroundColor: PURPLE_PALE,
    color: PURPLE,
  },

  resendRow: { alignItems: "center", marginTop: 14, marginBottom: 2 },
  timerText: { fontSize: 13, color: MUTED },
  timerHighlight: { fontWeight: "700", color: PURPLE },
  resendText: { fontSize: 13, color: PURPLE, fontWeight: "700" },

  backBtn: { alignItems: "center", marginTop: 14 },
  backBtnText: { fontSize: 13, color: MUTED, fontWeight: "500" },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 42,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: INK,
    textAlign: "center",
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 12,
  },
  countryRowActive: { backgroundColor: PURPLE_PALE },
  cFlag: { fontSize: 24 },
  cName: { flex: 1, fontSize: 15, color: INK, fontWeight: "600" },
  cCode: { fontSize: 13, color: MUTED, fontWeight: "600" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: BG_INPUT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: INK },
});
