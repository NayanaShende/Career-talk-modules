import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* FULL BACKGROUND IMAGE */}
      <ImageBackground
        source={require("../assets/mentor.jpg")} // change image here
        style={styles.image}
        resizeMode="cover"
      >
        {/* DARK OVERLAY FOR TEXT VISIBILITY */}
        <LinearGradient
          colors={["rgba(0,0,0,8.45)", "rgba(0,0,8,0.15)", "transparent"]}
          style={styles.overlay}
        />

        {/* TOP CONTENT */}
        <View style={styles.textContainer}>
          <Text style={styles.logo}>CareerTalk</Text>

          <Text style={styles.title}>Find Your Career Mentor</Text>

          <Text style={styles.subtitle}>
            Your path to growth starts with the right mentor🚀
          </Text>
        </View>

        {/* BOTTOM CURVED GRADIENT */}
        <LinearGradient
          colors={["#78b1ea", "#3737b4", "#a675bf"]}
          style={styles.bottomCurve}
        >
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/loginOtp")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  image: {
    flex: 1,
    justifyContent: "space-between",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  textContainer: {
    alignItems: "center",
    marginTop: 120,
    paddingHorizontal: 30,
  },

  logo: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "Inter-Bold",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
  },

  bottomCurve: {
    height: 260,
    borderTopLeftRadius: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 70,
    borderRadius: 40,
    elevation: 8,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#030200",
  },
});
