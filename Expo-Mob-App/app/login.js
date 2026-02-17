import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import PhoneInput from "react-native-phone-input";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// ✅ IMPORT YOUR API INSTANCE
import API from "../services/api";

export default function LoginScreen() {
  const phoneInput = useRef(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    Keyboard.dismiss();

    const number = phoneInput.current?.getValue();

    if (!number || number.length < 8) {
      alert("Enter valid phone number");
      return;
    }

    setLoading(true);

    try {
      // ✅ USE API INSTANCE
      await API.post("/auth/send-otp", {
        mobile: number,
      });

      router.push({
        pathname: "/otpVerify",
        params: { mobile: number },
      });

    } catch (err) {
      console.log(err?.response?.data || err.message);
      alert("Failed to send OTP");
    }

    setLoading(false);
  };

  return (
    <LinearGradient colors={["#0c69ff", "#fffef7", "#5b9cff"]} style={{ flex: 1 }}>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <SafeAreaView style={styles.container}>
              
              <View style={styles.card}>
                
                <Image
                  source={require("../assets/login.png")}
                  style={styles.image}
                  resizeMode="contain"
                />

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to continue</Text>

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
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    width: 160,
    height: 160,
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e2a78",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 15,
    color: "#6c757d",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d0d7ff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginTop: 10,
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
});
