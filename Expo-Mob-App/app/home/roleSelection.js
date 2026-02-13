import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import axiosInstance from "../../services/api";
import userIcon from "../../assets/user.png";
import expertIcon from "../../assets/expert.png";

export default function RoleSelectionScreen() {
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);

      // Navigate to next screen
      if (role === "expert") router.push("/home/expertProfile");
      else if (role === "jobseeker") router.push("/home/jobSeekerProfile");
      else Alert.alert("Error", "Unknown role selected");
    } catch (err) {
      Alert.alert("Error", "Failed to select role.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Select Your Role</Text>

        <View style={styles.options}>
          {/* Jobseeker */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleRoleSelect("jobseeker")}
            disabled={loading}
          >
            <View style={styles.circle}>
              <Image
                source={userIcon}
                style={styles.icon}
                resizeMode="contain"
              />
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
              <Image
                source={expertIcon}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.optionText}>Expert</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
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
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 60,
    height: 60,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
