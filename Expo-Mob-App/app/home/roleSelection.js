import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import userIcon from "../../assets/user.png";
import expertIcon from "../../assets/expert.png";

export default function RoleSelectionScreen() {
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);

      if (role === "expert") {
        router.push("/home/expertProfile");
      } else if (role === "jobseeker") {
        router.push("/home/jobSeekerProfile");
      } else {
        Alert.alert("Unknown role");
      }
    } catch (err) {
      Alert.alert("Error selecting role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
          colors={["#0c69ff", "#fffef7", "#5b9cff"]}
          style={{ flex: 1 }}
        >
      {/* Background Wave */}
      

      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Choose how you want to use the app
          </Text>

          <View style={styles.options}>
            {/* Jobseeker */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleRoleSelect("jobseeker")}
              disabled={loading}
            >
              <View style={styles.circle}>
                <Image source={userIcon} style={styles.icon} />
              </View>
              <Text style={styles.optionText}>Jobseeker</Text>
            </TouchableOpacity>

            {/* Expert */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleRoleSelect("expert")}
              disabled={loading}
            >
              <View style={styles.circle}>
                <Image source={expertIcon} style={styles.icon} />
              </View>
              <Text style={styles.optionText}>Expert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bgImage: {
    position: "absolute",
    width: "120%",
    height: "100%",
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

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e2a78",
  },

  subtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 25,
    marginTop: 5,
    textAlign: "center",
  },

  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  option: {
    alignItems: "center",
    flex: 1,
  },

  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eaf2ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  icon: {
    width: 55,
    height: 55,
  },

  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2f5cff",
  },
});
