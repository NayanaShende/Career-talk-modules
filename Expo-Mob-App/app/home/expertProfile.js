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

export default function ExpertProfileScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    qualification: "",
    experience: "",
    expertise: "",
    customExpertise: "",
    linkedin: "",
    certifications: "",
    cvFile: null,
  });

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
                  <Text style={{ fontSize: 28 }}>🎓</Text>
                </View>
                <View>
                  <Text style={styles.title}>Expert Profile</Text>
                  <Text style={styles.subtitle}>
                    Showcase your professional expertise
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
              {/* Mobile */}
              <Text style={styles.label}>Mobile</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                onChangeText={(v) => handleChange("mobile", v)}
              />

              {/* Qualification */}
              <Text style={styles.label}>Highest Qualification</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., PhD, M.Tech, MBA"
                onChangeText={(v) => handleChange("qualification", v)}
              />

              {/* Experience */}
              <Text style={styles.label}>Years of Experience</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.experience}
                  onValueChange={(v) => handleChange("experience", v)}
                >
                  <Picker.Item label="Select Experience" value="" />
                  <Picker.Item label="1-3 Years" value="1-3 Years" />
                  <Picker.Item label="4-7 Years" value="4-7 Years" />
                  <Picker.Item label="8-12 Years" value="8-12 Years" />
                  <Picker.Item label="12+ Years" value="12+ Years" />
                </Picker>
              </View>

              {/* Expertise */}
              <Text style={styles.label}>Area of Expertise</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.expertise}
                  onValueChange={(v) => handleChange("expertise", v)}
                >
                  <Picker.Item label="Select Expertise" value="" />
                  <Picker.Item
                    label="Software Development"
                    value="Software Development"
                  />
                  <Picker.Item
                    label="Data Science & AI"
                    value="Data Science & AI"
                  />
                  <Picker.Item label="Cybersecurity" value="Cybersecurity" />
                  <Picker.Item
                    label="Cloud Computing"
                    value="Cloud Computing"
                  />
                  <Picker.Item label="UI/UX Design" value="UI/UX Design" />
                  <Picker.Item
                    label="Project Management"
                    value="Project Management"
                  />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {formData.expertise === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your expertise"
                  onChangeText={(v) => handleChange("customExpertise", v)}
                />
              )}

              {/* LinkedIn */}
              <Text style={styles.label}>LinkedIn Profile URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://linkedin.com/in/yourprofile"
                onChangeText={(v) => handleChange("linkedin", v)}
              />

              {/* Certifications */}
              <Text style={styles.label}>Certifications</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="List your certifications"
                multiline
                onChangeText={(v) => handleChange("certifications", v)}
              />

              {/* Upload CV */}
              <TouchableOpacity style={styles.uploadBtn} onPress={pickFile}>
                <Text style={styles.uploadText}>
                  {formData.cvFile
                    ? formData.cvFile.name
                    : "Upload Resume / CV"}
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitProfile}
              >
                <Text style={styles.submitText}>Save Expert Profile</Text>
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
