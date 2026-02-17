import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";

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
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === "success") {
      setFormData({ ...formData, cv: result });
    }
  };

  const handleSubmit = () => {
    Alert.alert("Success", "Expert Profile Submitted");
  };

  return (
    <LinearGradient
      colors={["#041C32", "#0A2A5A", "#2F6FED"]}
      style={styles.gradient}
    >
      {/* bottom wave */}
      {/* <Image
        source={require("../../assets/bg-wave.png")}
        style={styles.wave}
        resizeMode="cover"
      /> */}

      <Text style={styles.heading}>Expert</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Your Expert Profile</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            onChangeText={(v) => handleChange("fullName", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
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
              <Picker.Item label="Select experience level" value="" />
              <Picker.Item label="1-3 Years" value="1-3 Years" />
              <Picker.Item label="3-5 Years" value="3-5 Years" />
              <Picker.Item label="5+ Years" value="5+ Years" />
              <Picker.Item label="10+ Years" value="10+ Years" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Expertise Domain"
            onChangeText={(v) => handleChange("domain", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Certifications"
            onChangeText={(v) => handleChange("certifications", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="LinkedIn Profile URL"
            onChangeText={(v) => handleChange("linkedIn", v)}
          />

          <TouchableOpacity style={styles.fileBtn} onPress={handleFilePick}>
            <Text style={styles.fileBtnText}>
              {formData.cv ? formData.cv.name : "Upload CV"}
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

export default ExpertProfileScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  heading: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 70,
  },

  wave: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 220,
    opacity: 0.9,
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
