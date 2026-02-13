import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import axiosInstance from "../../services/api";


const ExpertProfileScreen = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    experience: "",
    domain: "",
    certifications: "",
    linkedIn: "",
    cv: null,
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.type === "success") {
        setFormData({ ...formData, cv: result });
      }
    } catch (err) {
      console.error("Document pick error:", err);
      Alert.alert("Error", "Unable to pick document.");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = ""; // Replace with AsyncStorage.getItem("token")
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("dob", formData.dob);
      payload.append("qualification", formData.qualification);
      payload.append("experience", formData.experience);
      payload.append("domain", formData.domain);
      payload.append("certifications", formData.certifications);
      payload.append("linkedIn", formData.linkedIn);

      if (formData.cv) {
        payload.append("cv", {
          uri: formData.cv.uri,
          name: formData.cv.name,
          type: formData.cv.mimeType || "application/pdf",
        });
      }

      const res = await axiosInstance.post("/profile/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Server Response:", res.data);
      Alert.alert("Success", "Expert Profile Created!");
      // Navigate to dashboard or next screen
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error occurred while submitting profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Expert Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(val) => handleChange("fullName", val)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        keyboardType="email-address"
        onChangeText={(val) => handleChange("email", val)}
      />

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={formData.dob}
        onChangeText={(val) => handleChange("dob", val)}
      />

      <TextInput
        style={styles.input}
        placeholder="Highest Qualification"
        value={formData.qualification}
        onChangeText={(val) => handleChange("qualification", val)}
      />

      <Picker
        selectedValue={formData.experience}
        onValueChange={(val) => handleChange("experience", val)}
        style={styles.picker}
      >
        <Picker.Item label="Select experience level" value="" />
        <Picker.Item label="1-3 Years" value="1-3 Years" />
        <Picker.Item label="3-5 Years" value="3-5 Years" />
        <Picker.Item label="5+ Years" value="5+ Years" />
        <Picker.Item label="10+ Years" value="10+ Years" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Expertise Domain"
        value={formData.domain}
        onChangeText={(val) => handleChange("domain", val)}
      />

      <TextInput
        style={styles.input}
        placeholder="Certifications"
        value={formData.certifications}
        onChangeText={(val) => handleChange("certifications", val)}
      />

      <TextInput
        style={styles.input}
        placeholder="LinkedIn Profile URL"
        value={formData.linkedIn}
        onChangeText={(val) => handleChange("linkedIn", val)}
      />

      <TouchableOpacity style={styles.fileBtn} onPress={handleFilePick}>
        <Text style={styles.fileBtnText}>
          {formData.cv ? `Selected: ${formData.cv.name}` : "Upload CV"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ExpertProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  fileBtn: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  fileBtnText: {
    fontSize: 16,
    color: "#333",
  },
  submitBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
