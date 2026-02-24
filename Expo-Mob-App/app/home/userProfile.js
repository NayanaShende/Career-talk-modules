import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const [role, setRole] = useState("Jobseeker");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    qualification: "",
    customQualification: "",
    domain: "",
    customDomain: "",
    experience: "",
    cv: null,
  });

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const handleChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

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
      // ✅ VALIDATIONS
      if (!formData.fullName.trim())
        return Alert.alert("Missing", "Please enter full name");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email))
        return Alert.alert("Invalid Email", "Enter valid email");

      if (!formData.dob)
        return Alert.alert("Missing", "Please select birth date");

      if (!formData.qualification)
        return Alert.alert("Missing", "Select qualification");

      if (!formData.domain) return Alert.alert("Missing", "Select domain");

      if (!formData.experience)
        return Alert.alert("Missing", "Select experience");

      if (!formData.cv) return Alert.alert("Missing", "Upload your CV");

      // ✅ GET TOKEN
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session Expired", "Please login again");
        return;
      }

      // ✅ PREPARE FORM DATA
      const form = new FormData();

      form.append("fullName", formData.fullName);
      form.append("role", role.toLowerCase());
      form.append("email", formData.email);
      form.append("dob", formData.dob);
      form.append("qualification", formData.qualification);
      form.append("domain", formData.domain);
      form.append("experience", formData.experience);

      if (formData.cv) {
        form.append("cv", {
          uri: formData.cv.uri,
          name: formData.cv.name || "cv.pdf",
          type: "application/pdf",
        });
      }

      // ✅ API CALL - Updated IP to 192.168.1.17
      const res = await axios.post(
        "http://192.168.1.10:3000/api/users/save-profile", // replace with PC IP
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Alert.alert("Success", "Profile saved successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
        },
      ]);
    } catch (error) {
      console.log("PROFILE ERROR:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Could not save profile",
      );
    }
  };

  const saveRole = async (selectedRole) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        "http://192.168.1.10:3000/api/auth/set-role",
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Role saved");
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#f5f7fb", "#eef2ff"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Create Profile</Text>

              {/* ROLE */}
              <Text style={styles.label}>Select Role</Text>
              <View style={styles.roleRow}>
                {["Jobseeker", "Expert"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.roleBtn,
                      role === item && styles.roleSelected,
                    ]}
                    onPress={() => setRole(item)}>
                    <Text
                      style={[
                        styles.roleText,
                        role === item && { color: "#fff" },
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* NAME */}
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                onChangeText={(v) => handleChange("fullName", v)}
              />

              {/* EMAIL */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                keyboardType="email-address"
                onChangeText={(v) => handleChange("email", v)}
              />

              {/* DOB */}
              <Text style={styles.label}>Birth Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShow(true)}>
                <Text style={{ color: formData.dob ? "#000" : "#999" }}>
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
              <Text style={styles.label}>Qualification</Text>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.qualification}
                      onValueChange={(v) => handleChange("qualification", v)}>
                      <Picker.Item label="Select Qualification" value="" />
                      <Picker.Item label="Graduate" value="Graduate" />
                      <Picker.Item label="Post Graduate" value="PG" />
                      <Picker.Item label="Diploma" value="Diploma" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>
                </View>

                {formData.qualification === "Other" && (
                  <TextInput
                    style={[styles.input, styles.otherBox]}
                    placeholder="Other"
                    onChangeText={(v) => handleChange("customQualification", v)}
                  />
                )}
              </View>

              {/* DOMAIN */}
              <Text style={styles.label}>Domain</Text>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.domain}
                      onValueChange={(v) => handleChange("domain", v)}>
                      <Picker.Item label="Select Domain" value="" />
                      <Picker.Item label="React Developer" value="React" />
                      <Picker.Item label="Java Developer" value="Java" />
                      <Picker.Item label="Python Developer" value="Python" />
                      <Picker.Item label="Other" value="Other" />
                    </Picker>
                  </View>
                </View>

                {formData.domain === "Other" && (
                  <TextInput
                    style={[styles.input, styles.otherBox]}
                    placeholder="Other"
                    onChangeText={(v) => handleChange("customDomain", v)}
                  />
                )}
              </View>

              {/* EXPERIENCE */}
              <Text style={styles.label}>Experience</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.experience}
                  onValueChange={(v) => handleChange("experience", v)}>
                  <Picker.Item label="Select Experience" value="" />
                  <Picker.Item label="Fresher" value="Fresher" />
                  <Picker.Item label="1-2 Years" value="1-2" />
                  <Picker.Item label="3-5 Years" value="3-5" />
                  <Picker.Item label="5+ Years" value="5+" />
                </Picker>
              </View>

              {/* CV UPLOAD */}
              <Text style={styles.label}>Upload CV</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickCV}>
                <Text style={styles.uploadText}>
                  {formData.cv ? formData.cv.name : "Select CV File"}
                </Text>
              </TouchableOpacity>

              {/* SUBMIT */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitProfile}>
                <Text style={styles.submitText}>Save & Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  label: { marginBottom: 6, fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#fff",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#dbe2ef",
    borderRadius: 10,
    backgroundColor: "#f8f9fc",
  },
  row: { flexDirection: "row", alignItems: "center" },
  flex: { flex: 1 },
  otherBox: { width: 110, marginLeft: 8 },
  roleRow: { flexDirection: "row", marginBottom: 10 },
  roleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2F6FED",
    alignItems: "center",
    marginRight: 10,
  },
  roleSelected: { backgroundColor: "#2F6FED" },
  roleText: { color: "#2F6FED", fontWeight: "600" },
  uploadBtn: {
    marginTop: 10,
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: { color: "#2F6FED", fontWeight: "600" },
  submitBtn: {
    marginTop: 25,
    backgroundColor: "#2F6FED",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
