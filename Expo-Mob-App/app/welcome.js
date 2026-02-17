import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const { height } = Dimensions.get("window");

export default function Welcome() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.logo}>CareerTalk</Text>

        <Text style={styles.title}>Find Your Career Mentor</Text>

        <Text style={styles.subtitle}>
          Connect with experts and grow faster 🚀
        </Text>
      </View>

      {/* CURVED GRADIENT */}
      <LinearGradient
        colors={["#5EA8FF", "#6366F1", "#7C3AED"]}
        style={styles.gradient}
      >
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0A66C2",
    marginBottom: 25,
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },

  /* PERFECT CURVE */
  gradient: {
    height: height * 0.38,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 55,
    borderRadius: 35,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
  },
});
