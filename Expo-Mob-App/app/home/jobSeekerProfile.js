import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";



export default function JobseekerProfileScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    qualification: "",
    experience: "",
    domain: "",
    customDomain: "",
    cvFile: null,
  });
   const navigation = useNavigation();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setFormData({ ...formData, cvFile: result.assets[0] });
    }
  };
  const submitProfile = () => {
    if (!isValidEmail(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    Alert.alert("Success", "Profile Submitted");
        navigation.navigate("dashboard/dashboard");

  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const [emailError, setEmailError] = useState("");



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#f5f7fb", "#eef2ff"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 28 }}>👤</Text>
                </View>
                <View>
                  <Text style={styles.title}>Jobseeker Profile</Text>
                  <Text style={styles.subtitle}>
                    Let us know about your skills
                  </Text>
                </View>
              </View>

              {/* Full Name */}
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                onChangeText={(v) => handleChange("fullName", v)}
              />

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(v) => {
                  handleChange("email", v);

                  if (!isValidEmail(v)) {
                    setEmailError(
                      "Enter valid email (example: xyz@gmail.com)",
                    );
                  } else {
                    setEmailError("");
                  }
                }}
              />

              {emailError ? (
                <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {emailError}
                </Text>
              ) : null}

              {/* Mobile */}
              <Text style={styles.label}>Mobile</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                onChangeText={(v) => handleChange("mobile", v)}
              />

              {/* Qualification */}
              <Text style={styles.label}>Qualification</Text>
              <TextInput
                style={styles.input}
                placeholder="Highest qualification"
                onChangeText={(v) => handleChange("qualification", v)}
              />

              {/* Experience */}
              <Text style={styles.label}>Experience</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.experience}
                  onValueChange={(v) => handleChange("experience", v)}
                >
                  <Picker.Item label="Select Experience" value="" />
                  <Picker.Item label="Fresher" value="Fresher" />
                  <Picker.Item label="1-2 Years" value="1-2 Years" />
                  <Picker.Item label="3-5 Years" value="3-5 Years" />
                  <Picker.Item label="5+ Years" value="5+ Years" />
                </Picker>
              </View>

              {/* Domain */}
              <Text style={styles.label}>Domain / Job Role</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.domain}
                  onValueChange={(v) => handleChange("domain", v)}
                >
                  <Picker.Item label="Select Domain" value="" />
                  <Picker.Item
                    label="React Developer"
                    value="React Developer"
                  />
                  <Picker.Item label="Java Developer" value="Java Developer" />
                  <Picker.Item
                    label="Python Developer"
                    value="Python Developer"
                  />
                  <Picker.Item label="Data Analyst" value="Data Analyst" />
                  <Picker.Item label="UI/UX Designer" value="UI/UX Designer" />
                  <Picker.Item
                    label="Full Stack Developer"
                    value="Full Stack Developer"
                  />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {formData.domain === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your domain"
                  onChangeText={(v) => handleChange("customDomain", v)}
                />
              )}

              {/* Upload CV */}
              <TouchableOpacity style={styles.uploadBtn} onPress={pickFile}>
                <Text style={styles.uploadText}>
                  {formData.cvFile ? formData.cvFile.name : "Upload CV"}
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitProfile}
              >
                <Text style={styles.submitText}>Save Jobseeker Profile</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 13,
    color: "gray",
  },

  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#f8f9fc",
    borderWidth: 1,
    borderColor: "#dbe2ef",
    borderRadius: 10,
    padding: 12,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#dbe2ef",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f9fc",
  },

  uploadBtn: {
    marginTop: 18,
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  uploadText: {
    color: "#2F6FED",
    fontWeight: "600",
  },

  submitBtn: {
    marginTop: 20,
    backgroundColor: "#2F6FED",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
