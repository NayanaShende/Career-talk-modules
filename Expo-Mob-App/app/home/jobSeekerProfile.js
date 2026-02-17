import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const JobseekerProfileScreen = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    experience: "",
    domain: "",
    cvFile: null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        handleChange("cvFile", result.assets[0]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.experience) {
      Alert.alert("Missing fields", "Please fill all required fields");
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Invalid Email", "Enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // 👉 Replace with your API call later
      await new Promise((res) => setTimeout(res, 1200));

      Alert.alert("Success", "Profile Submitted Successfully");
      router.replace("/dashboard/dashboard");

    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0c69ff", "#fffef7", "#5b9cff"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>

              <Text style={styles.title}>Create Your Jobseeker Profile</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={formData.fullName}
                onChangeText={(v) => handleChange("fullName", v)}
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v) => handleChange("email", v)}
              />

              <TextInput
                style={styles.input}
                placeholder="Date of Birth (YYYY-MM-DD)"
                value={formData.dob}
                onChangeText={(v) => handleChange("dob", v)}
              />

              <TextInput
                style={styles.input}
                placeholder="Highest Qualification"
                value={formData.qualification}
                onChangeText={(v) => handleChange("qualification", v)}
              />

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.experience}
                  onValueChange={(v) => handleChange("experience", v)}
                >
                  <Picker.Item label="Select experience level *" value="" />
                  <Picker.Item label="Fresher" value="Fresher" />
                  <Picker.Item label="1-3 Years" value="1-3 Years" />
                  <Picker.Item label="3-5 Years" value="3-5 Years" />
                  <Picker.Item label="5+ Years" value="5+ Years" />
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Desired Domain / Job Role"
                value={formData.domain}
                onChangeText={(v) => handleChange("domain", v)}
              />

              <TouchableOpacity style={styles.fileBtn} onPress={handleFilePick}>
                <Text style={styles.fileBtnText}>
                  {formData.cvFile
                    ? `${formData.cvFile.name} (${Math.round(
                        formData.cvFile.size / 1024
                      )} KB)`
                    : "Upload CV"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit Profile</Text>
                )}
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default JobseekerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 60,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 22,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginTop: 40,
    marginBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#1b2a49",
  },

  input: {
    backgroundColor: "#f4f6fb",
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },

  pickerWrapper: {
    backgroundColor: "#f4f6fb",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },

  fileBtn: {
    backgroundColor: "#e6ecff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 22,
  },

  fileBtnText: {
    color: "#2F6FED",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },

  submitBtn: {
    backgroundColor: "#2F6FED",
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
