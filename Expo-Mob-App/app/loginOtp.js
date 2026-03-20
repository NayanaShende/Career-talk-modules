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
import Svg, { Rect, Path, Line, Circle, G } from "react-native-svg";
import { router } from "expo-router";
import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const GREEN = "#867795";
const GREEN_DARK = "#746583";
const GREEN_LIGHT = "#f4eafd";
const GREEN_MID = "#574964";
const GREEN_PALE = "#c6b0db";
const WHITE = "#FFFFFF";
const INK = "#0D1F1B";
const MUTED = "#574964";
const MUTED2 = "#574964";
const BORDER = "#574964";
const BG_INPUT = "#f5ebff";
const ERR = "#DC2626";

// ─── Decorative Background Blobs ─────────────────────────────────────────────
function BackgroundDecor() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Top-right large circle */}
      <Circle cx={width + 40} cy={-40} r={160} fill="rgba(255,255,255,0.07)" />
      {/* Mid-left circle */}
      <Circle
        cx={-60}
        cy={height * 0.38}
        r={120}
        fill="rgba(255,255,255,0.05)"
      />
      {/* Small accent */}
      <Circle
        cx={width * 0.75}
        cy={height * 0.22}
        r={50}
        fill="rgba(255,255,255,0.06)"
      />
      {/* Bottom right */}
      <Circle
        cx={width + 20}
        cy={height * 0.55}
        r={90}
        fill="rgba(0,0,0,0.04)"
      />
    </Svg>
  );
}

// ─── CareerTalk Logo ──────────────────────────────────────────────────────────
function CareerTalkLogo() {
  return (
    <View style={styles.logoBox}>
      <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
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
        <Path
          d="M9 10V8a4 4 0 018 0v2"
          stroke="white"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Line
          x1={13}
          y1={10}
          x2={13}
          y2={23}
          stroke="white"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ num, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  const slideUp = useRef(new Animated.Value(24)).current;

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
    if (e.nativeEvent.key === "Backspace" && otp[i] === "" && i > 0)
      otpRefs.current[i - 1]?.focus();
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await API.post("/auth/send-otp", {
        mobile: `+${selectedCountry.callingCode}${mobile}`,
      });
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimer(60);
      setIsTimerActive(true);
      otpRefs.current[0]?.focus(); // auto-focus first OTP box
    } catch {
      setError("Failed to resend OTP.");
    }
    setLoading(false);
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
            {/* ── HERO SECTION ── */}
            <View style={styles.hero}>
              <BackgroundDecor />

              {/* Logo row */}
              <View style={styles.logoRow}>
                <CareerTalkLogo />
                <Text style={styles.appName}>CareerTalk</Text>
              </View>

              {/* Badge */}
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  🌱 Grow your career with expert mentorship
                </Text>
              </View>

              {/* Headline */}
              <Text style={styles.headline}>
                Find your{"\n"}
                <Text style={styles.headlineAccent}>direction.</Text>
              </Text>
              <Text style={styles.subline}>
                One conversation with the right expert{"\n"}can change your
                entire career path.
              </Text>
            </View>

            {/* ── FORM CARD ── */}
            <View style={styles.formCard}>
              {/* Pill handle */}
              <View style={styles.cardHandle} />

              {!otpSent ? (
                <>
                  <Text style={styles.formTitle}>Welcome back</Text>
                  <Text style={styles.formSub}>
                    Enter your mobile number to continue
                  </Text>

                  {/* Phone Input */}
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
                      <Text style={styles.chevron}>▾</Text>
                    </TouchableOpacity>
                    <View style={styles.divLine} />
                    <TextInput
                      style={styles.numInput}
                      keyboardType="number-pad"
                      placeholder="Mobile number"
                      placeholderTextColor="#574964"
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
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <Text style={styles.ctaBtnText}>Sending…</Text>
                    ) : (
                      <View style={styles.ctaBtnInner}>
                        <Text style={styles.ctaBtnText}>Get OTP</Text>
                        <View style={styles.ctaArrow}>
                          <Text style={styles.ctaArrowText}>→</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.legalText}>
                    By continuing you agree to our{" "}
                    <Text style={styles.legalLink}>Terms</Text> &{" "}
                    <Text style={styles.legalLink}>Privacy Policy</Text>
                  </Text>
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
                  <Text style={styles.formTitle}>Verify number</Text>
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
                        Resend in{" "}
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
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <Text style={styles.ctaBtnText}>Verifying…</Text>
                    ) : (
                      <View style={styles.ctaBtnInner}>
                        <Text style={styles.ctaBtnText}>Verify & Continue</Text>
                        <View style={styles.ctaArrow}>
                          <Text style={styles.ctaArrowText}>→</Text>
                        </View>
                      </View>
                    )}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GREEN },
  root: { flex: 1, backgroundColor: GREEN },

  // Hero
  hero: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: "center",
    overflow: "hidden",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.3,
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroBadgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },

  headline: {
    fontSize: 42,
    fontWeight: "800",
    color: WHITE,
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 12,
  },
  headlineAccent: {
    color: GREEN_PALE,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
    marginBottom: 26,
  },

  // Stat cards
  statRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  statNum: { fontSize: 16, fontWeight: "800", color: WHITE },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
    fontWeight: "600",
  },

  // Form card
  formCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 14,
  },
  cardHandle: {
    width: 38,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 22,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: INK,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  formSub: { fontSize: 13, color: MUTED, marginBottom: 22, lineHeight: 20 },
  numHighlight: { fontWeight: "700", color: GREEN },

  // Phone input
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_INPUT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  phoneRowErr: { borderColor: ERR },
  countryBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  flagEmoji: { fontSize: 20 },
  dialCode: { fontSize: 14, fontWeight: "600", color: INK, marginLeft: 4 },
  chevron: { fontSize: 12, color: MUTED, marginLeft: 3 },
  divLine: {
    width: 1,
    height: 24,
    backgroundColor: BORDER,
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
    backgroundColor: GREEN,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },
  ctaBtnDim: { opacity: 0.65 },
  ctaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaArrowText: { color: WHITE, fontSize: 15, fontWeight: "700" },

  legalText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 11.5,
    color: MUTED,
    lineHeight: 18,
  },
  legalLink: { color: GREEN, fontWeight: "700" },

  // OTP
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
    marginTop: 4,
    marginBottom: 4,
  },
  otpCell: {
    flex: 1,
    height: 54,
    borderRadius: 13,
    backgroundColor: BG_INPUT,
    borderWidth: 1.5,
    borderColor: BORDER,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: INK,
  },
  otpCellFilled: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
    color: GREEN,
  },

  resendRow: { alignItems: "center", marginTop: 14, marginBottom: 2 },
  timerText: { fontSize: 13, color: MUTED },
  timerHighlight: { fontWeight: "700", color: GREEN },
  resendText: { fontSize: 13, color: GREEN, fontWeight: "700" },

  backBtn: { alignItems: "center", marginTop: 14 },
  backBtnText: { fontSize: 13, color: MUTED, fontWeight: "500" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 44,
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
    fontSize: 17,
    fontWeight: "800",
    color: INK,
    textAlign: "center",
    marginBottom: 14,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 12,
  },
  countryRowActive: { backgroundColor: GREEN_LIGHT },
  cFlag: { fontSize: 24 },
  cName: { flex: 1, fontSize: 15, color: INK, fontWeight: "600" },
  cCode: { fontSize: 13, color: MUTED, fontWeight: "600" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 14,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: GREEN },
});
