import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ProfileScreen() {
  const [role, setRole] = useState("Jobseeker");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    customQualification: "",
    domain: "",
    customDomain: "",
    experience: "",
    customExperience: "", // 🔥 ADDED
    cv: null,
    certificate: "",
    languages: "",
    customLanguages: "", // 🔥 ADDED
    location: "",
    customLocation: "", // 🔥 ADDED
    bio: "",
    certifiedCity: "", // 🔥 ADDED FOR EXPERT ONLY
    customCertifiedCity: "", // 🔥 ADDED
  });

  const handleChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);

    const formatted =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(currentDate.getDate()).padStart(2, "0");

    handleChange("dob", formatted);
  };

  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      handleChange("cv", result.assets[0]);
    }
  };

  const submitProfile = async () => {
    try {
      if (!formData.fullName.trim())
        return Alert.alert("Missing", "Please enter full name");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return Alert.alert("Invalid Email", "Enter valid email");

      if (!formData.dob) return Alert.alert("Missing", "Select birth date");
      if (!formData.qualification)
        return Alert.alert("Missing", "Select qualification");

      if (!formData.domain) return Alert.alert("Missing", "Select domain");
      if (!formData.experience)
        return Alert.alert("Missing", "Select experience");

      if (!formData.cv) return Alert.alert("Missing", "Upload your CV");

      const token = await AsyncStorage.getItem("token");

      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "cv") form.append(key, formData[key]);
      });

      if (formData.cv) {
        form.append("cv", {
          uri: formData.cv.uri,
          name: formData.cv.name || "cv.pdf",
          type: "application/pdf",
        });
      }

      await axios.post(
        "http://10.89.141.9:3000/api/users/save-profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Alert.alert("Success", "Profile saved!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Could not save profile",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Profile Information</Text>

          {/* ROLE SELECT */}
          <Text style={styles.label}>Select Role</Text>
          <View style={styles.roleRow}>
            {["Jobseeker", "Expert"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.roleBtn, role === item && styles.roleSelected]}
                onPress={() => setRole(item)}
              >
                <Text
                  style={[styles.roleText, role === item && { color: "#fff" }]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* FULL NAME */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            onChangeText={(v) => handleChange("fullName", v)}
          />

          {/* EMAIL */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            onChangeText={(v) => handleChange("email", v)}
          />

          {/* DOB */}
          <Text style={styles.label}>Birth Date *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
            <Text style={{ color: formData.dob ? "#000" : "#777" }}>
              {formData.dob || "Select Birth Date"}
            </Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

          {/* QUALIFICATION */}
          <Text style={styles.label}>Qualification *</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={formData.qualification}
              onValueChange={(v) => handleChange("qualification", v)}
            >
              <Picker.Item label="Select Qualification" value="" />
              <Picker.Item label="Graduate" value="Graduate" />
              <Picker.Item label="Post Graduate" value="PG" />
              <Picker.Item label="Diploma" value="Diploma" />
              <Picker.Item label="Marathi Medium" value="Marathi Medium" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {formData.qualification === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom qualification"
              onChangeText={(v) => handleChange("customQualification", v)}
            />
          )}

          {/* DOMAIN */}
          <Text style={styles.label}>Domain *</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={formData.domain}
              onValueChange={(v) => handleChange("domain", v)}
            >
              <Picker.Item label="Select Domain" value="" />
              <Picker.Item label="React Developer" value="React" />
              <Picker.Item label="Java Developer" value="Java" />
              <Picker.Item label="Python Developer" value="Python" />
              <Picker.Item label="Marathi Teacher" value="Marathi Teacher" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {formData.domain === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom domain"
              onChangeText={(v) => handleChange("customDomain", v)}
            />
          )}

          {/* EXPERIENCE */}
          <Text style={styles.label}>Experience *</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={formData.experience}
              onValueChange={(v) => handleChange("experience", v)}
            >
              <Picker.Item label="Select Experience" value="" />
              <Picker.Item label="Fresher" value="Fresher" />
              <Picker.Item label="1-2 Years" value="1-2" />
              <Picker.Item label="3-5 Years" value="3-5" />
              <Picker.Item label="5+ Years" value="5+" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {formData.experience === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom experience"
              onChangeText={(v) => handleChange("customExperience", v)}
            />
          )}

          {/* CV */}
          <Text style={styles.label}>Upload CV *</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickCV}>
            <Text style={{ fontWeight: "600" }}>
              {formData.cv ? formData.cv.name : "Choose File"}
            </Text>
          </TouchableOpacity>

          {/* ----------------- EXPERT ONLY FIELDS ----------------- */}
          {role === "Expert" && (
            <>
              {/* CERTIFICATE */}
              <Text style={styles.label}>Certification</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter certifications"
                onChangeText={(v) => handleChange("certificate", v)}
              />

              {/* CERTIFIED CITY */}
              <Text style={styles.label}>Certified City</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={formData.certifiedCity}
                  onValueChange={(v) => handleChange("certifiedCity", v)}
                >
                  <Picker.Item label="Select City" value="" />
                  <Picker.Item label="Mumbai" value="Mumbai" />
                  <Picker.Item label="Pune" value="Pune" />
                  <Picker.Item label="Nashik" value="Nashik" />
                  <Picker.Item label="Nagpur" value="Nagpur" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {formData.certifiedCity === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter custom certified city"
                  onChangeText={(v) => handleChange("customCertifiedCity", v)}
                />
              )}

              {/* LANGUAGES */}
              <Text style={styles.label}>Languages Known</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={formData.languages}
                  onValueChange={(v) => handleChange("languages", v)}
                >
                  <Picker.Item label="Select Language" value="" />
                  <Picker.Item label="English" value="English" />
                  <Picker.Item label="Hindi" value="Hindi" />
                  <Picker.Item label="Marathi" value="Marathi" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {formData.languages === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter custom language"
                  onChangeText={(v) => handleChange("customLanguages", v)}
                />
              )}

              {/* LOCATION */}
              <Text style={styles.label}>Your Location</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={formData.location}
                  onValueChange={(v) => handleChange("location", v)}
                >
                  <Picker.Item label="Select City" value="" />
                  <Picker.Item label="Mumbai" value="Mumbai" />
                  <Picker.Item label="Pune" value="Pune" />
                  <Picker.Item label="Nashik" value="Nashik" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {formData.location === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter custom location"
                  onChangeText={(v) => handleChange("customLocation", v)}
                />
              )}

              {/* BIO */}
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Short bio"
                multiline
                onChangeText={(v) => handleChange("bio", v)}
              />
            </>
          )}

          {/* SUBMIT */}
          <TouchableOpacity style={styles.submitBtn} onPress={submitProfile}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 7,
    color: "#0B2D72",
  },

  label: {
    marginTop: 15,
    fontWeight: "600",
    color: "#0B2D72",
  },

  input: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    marginTop: 5,
  },

  pickerBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginTop: 5,
  },

  roleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  roleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0B2D72",
    alignItems: "center",
  },

  roleSelected: {
    backgroundColor: "#0B2D72",
  },

  roleText: {
    color: "#0B2D72",
    fontWeight: "600",
  },

  uploadBtn: {
    backgroundColor: "#e5e7eb",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },

  submitBtn: {
    backgroundColor: "#0B2D72",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
