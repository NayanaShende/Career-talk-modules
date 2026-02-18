import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router"; // ✅ navigation

const JobseekerProfileScreen = () => {
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
    setFormData({ ...formData, [field]: value });
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.canceled === false) {
      setFormData({ ...formData, cvFile: result.assets[0] });
    }
  };

  const handleSubmit = () => {
    // ✅ validation
    if (!formData.fullName || !formData.email || !formData.experience) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    // ✅ success alert
    Alert.alert("Success", "Profile Submitted Successfully");

    // ✅ redirect to dashboard
    router.replace("/dashboard/dashboard");
  };

  return (
    <LinearGradient
          colors={["#0c69ff", "#fffef7", "#5b9cff"]}
          style={{ flex: 1 }}
        >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Your Jobseeker Profile</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            onChangeText={(v) => handleChange("fullName", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            keyboardType="email-address"
            onChangeText={(v) => handleChange("email", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            onChangeText={(v) => handleChange("dob", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Highest Qualification"
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
            onChangeText={(v) => handleChange("domain", v)}
          />

          <TouchableOpacity style={styles.fileBtn} onPress={handleFilePick}>
            <Text style={styles.fileBtnText}>
              {formData.cvFile ? formData.cvFile.name : "Upload CV"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default JobseekerProfileScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    elevation: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1b2a49",
  },

  input: {
    backgroundColor: "#f4f6fb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  pickerWrapper: {
    backgroundColor: "#f4f6fb",
    borderRadius: 12,
    marginBottom: 15,
  },

  fileBtn: {
    backgroundColor: "#e6ecff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  fileBtnText: {
    color: "#2F6FED",
    fontWeight: "600",
  },

  submitBtn: {
    backgroundColor: "#2F6FED",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
