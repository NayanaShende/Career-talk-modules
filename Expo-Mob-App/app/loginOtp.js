import { useRef, useState } from "react";
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
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneInput from "react-native-phone-input";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import API from "../services/api";
import { Image } from "react-native";



export default function LoginOtpScreen() {
  const phoneInput = useRef(null);

  const slideAnim = useRef(new Animated.Value(120)).current; // start lower
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current; // pop effect

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SEND OTP
  const handlePhoneChange = (number) => {
    let cleaned = number.replace(/\D/g, "");

    if (cleaned.startsWith("91")) {
      cleaned = cleaned.slice(2);
    }

    cleaned = cleaned.slice(0, 10);

    setMobile(cleaned);

    if (cleaned.length === 0) {
      setError("Mobile number is required");
    } else if (cleaned.length < 10) {
      setError("Mobile number must be 10 digits");
    } else {
      setError("");
    }
  };


  const validateMobile = (number) => {
    if (!number) return "Mobile number is required";
    if (!/^\d+$/.test(number)) return "Only digits allowed";
    if (number.length !== 10) return "Mobile number must be 10 digits";
    return "";
  };

  const sendOtp = async () => {
  Keyboard.dismiss();

const number = mobile;


  if (number.length !== 10) {
    setError("Mobile number must be 10 digits");
    return;
  }

  

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/send-otp", { mobile: number });

      setMobile(number);
      setOtpSent(true);

      // animate OTP popup
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

      // show OTP (testing only)
      if (res.data?.otp) {
        setServerOtp(res.data.otp);
        setOtp(res.data.otp);
      }
    } catch {
      setError("Failed to send OTP");
    }

    setLoading(false);
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", { mobile, otp });

      if (res.data?.success || res.status === 200) {
        router.replace("/home/roleSelection");
      } else {
        setError("Invalid OTP");
      }
    } catch {
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
          {/* TOP IMAGE */}
          <View style={styles.imageContainer}>
            {/* Add your image here */}
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
              }}
              style={styles.image}
            />
          </View>

          {/* WHITE CARD */}
          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your account</Text>

            {/* PHONE INPUT */}
            <PhoneInput
              ref={phoneInput}
              initialCountry="in"
              value={mobile}
              onChangePhoneNumber={handlePhoneChange}
              textProps={{
                placeholder: "Enter mobile number",
                keyboardType: "number-pad",
              }}
              style={styles.phoneInput}
              textStyle={styles.phoneText}
            />

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

            {/* OTP SECTION */}
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
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <TextInput
                        key={i}
                        style={styles.otpDigit}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otp[i] || ""}
                        onChangeText={(text) => {
                          let newOtp = otp.split("");
                          newOtp[i] = text;
                          setOtp(newOtp.join(""));
                        }}
                      />
                    ))}
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  activeOpacity={0.8}
                  onPress={verifyOtp}
                >
                  <Text style={styles.loginText}>Verify OTP</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <TouchableOpacity style={{ marginTop: 15 }}>
              <Text style={styles.forgot}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 8 }}>
              <Text style={styles.signup}>Don’t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 300, // show more image
    width: "100%",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -40,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingTop: 35,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  welcome: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1e2a78",
    marginTop: 10,
    marginBottom: 12,
  },

  subtitle: {
    color: "#393737",
    marginBottom: 25,
    fontSize: 17,
    fontWeight: "bold",
  },

  phoneInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
  },

  phoneText: {
    fontSize: 16,
    marginLeft: 10, // ✅ space after +91
  },

  loginButton: {
    backgroundColor: "#1C4D8D",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    height: 55,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  loginText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },

  forgot: {
    color: "#666",
    textAlign: "center",
  },

  signup: {
    textAlign: "center",
    color: "#2d73b6",
    fontWeight: "600",
  },

  otpBox: {
    marginTop: 20,
    alignItems: "center",
  },

  otpTitle: {
    marginBottom: 10,
    fontWeight: "600",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },

  otpDigit: {
    width: 48,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#f1f3f6",
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  errorText: {
    color: "red",
    marginTop: 6,
  },
});
