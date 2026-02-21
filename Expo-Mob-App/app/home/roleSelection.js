import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function RoleSelectionScreen() {
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);

      if (role === "expert") {
        router.push("/home/expertProfile");
      } else {
        router.push("/home/jobSeekerProfile");
      }
    } catch (err) {
      Alert.alert("Error selecting role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2563eb", "#4f8cff", "#a5c8ff"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Choose Your Role</Text>
        <Text style={styles.subHeader}>
          Select how you want to use CareerTalk
        </Text>

        {/* JOBSEEKER CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => handleRoleSelect("jobseeker")}
        >
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
            }}
            style={styles.image}
            imageStyle={{ borderRadius: 22 }}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.7)"]}
              style={styles.overlay}
            >
              <Text style={styles.roleTitle}>Jobseeker</Text>
              <Text style={styles.roleDesc}>
                Find mentors, get guidance, and grow your career faster.
              </Text>

              <View style={styles.buttonBlue}>
                <Text style={styles.btnText}>Select Role</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* EXPERT CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => handleRoleSelect("expert")}
        >
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60",
            }}
            style={styles.image}
            imageStyle={{ borderRadius: 22 }}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.7)"]}
              style={styles.overlay}
            >
              <Text style={styles.roleTitle}>Expert</Text>
              <Text style={styles.roleDesc}>
                Share knowledge, mentor others, and build your reputation.
              </Text>

              <View style={styles.buttonGreen}>
                <Text style={styles.btnText}>Select Role</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#fff" />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
  },

  header: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },

  subHeader: {
    fontSize: 15,
    color: "#eaf1ff",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 6,
  },

  card: {
    height:200,
    marginBottom: 22,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 8,
  },

  image: {
    height: 200,
    justifyContent: "flex-end",
  },

  overlay: {
    padding: 18,
  },

  roleTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  roleDesc: {
    color: "#e5e7eb",
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
  },

  buttonBlue: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    width: 120,
  },

  buttonGreen: {
    backgroundColor: "#22c55e",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    width: 120,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
