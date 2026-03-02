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
  Modal,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const BASE_URL = "http://192.168.1.3:3000"; // ✅ FIXED

function DropdownPicker({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: selected ? "#000" : "#777", fontSize: 15 }}>
          {selected ? selected.label : label}
        </Text>
        <Text style={{ color: "#777" }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />

        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{label}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  item.value === value && styles.modalItemSelected,
                ]}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: item.value === value ? "700" : "400",
                    color: item.value === value ? "#0B2D72" : "#333",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

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
    customExperience: "",
    cv: null,
    image: null,
    certificate: "",
    languages: "",
    customLanguages: "",
    location: "",
    customLocation: "",
    bio: "",
  });

  const handleChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  // 📌 DATE PICKER
  const onChangeDate = (event, selectedDate) => {
    const current = selectedDate || date;
    setShow(false);
    setDate(current);

    const formatted =
      current.getFullYear() +
      "-" +
      String(current.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(current.getDate()).padStart(2, "0");

    handleChange("dob", formatted);
  };

  // 📌 PICK CV
  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      handleChange("cv", result.assets[0]);
    }
  };

  // 📌 PICK IMAGE
  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) {
      return Alert.alert("Permission Required", "Enable gallery access.");
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!res.canceled) {
      handleChange("image", res.assets[0]);
    }
  };

  // 📌 SUBMIT PROFILE
  const submitProfile = async () => {
    try {
      if (!formData.fullName.trim())
        return Alert.alert("Missing", "Full name is required");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return Alert.alert("Invalid Email");

      if (!formData.dob) return Alert.alert("Missing", "Select birth date");

      if (!formData.qualification)
        return Alert.alert("Missing", "Select qualification");

      if (!formData.domain) return Alert.alert("Missing", "Select domain");

      if (!formData.experience)
        return Alert.alert("Missing", "Select experience");

      if (!formData.cv) return Alert.alert("Missing", "Upload your CV");

      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Login Required");

      // STEP 1: SET ROLE
      await axios.post(
        `${BASE_URL}/api/auth/set-role`,
        { role: role.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // STEP 2: SAVE PROFILE
      const form = new FormData();

      form.append("role", role.toLowerCase());

      // ✔ Resolve "Other" fields
      const resolved = {
        ...formData,
        location:
          formData.location === "Other"
            ? formData.customLocation
            : formData.location,
        domain:
          formData.domain === "Other" ? formData.customDomain : formData.domain,
        qualification:
          formData.qualification === "Other"
            ? formData.customQualification
            : formData.qualification,
        experience:
          formData.experience === "Other"
            ? formData.customExperience
            : formData.experience,
        languages:
          formData.languages === "Other"
            ? formData.customLanguages
            : formData.languages,
      };

      const skip = [
        "cv",
        "image",
        "customLocation",
        "customDomain",
        "customQualification",
        "customExperience",
        "customLanguages",
      ];

      Object.keys(resolved).forEach((key) => {
        if (
          !skip.includes(key) &&
          resolved[key] !== "" &&
          resolved[key] !== null
        ) {
          form.append(key, resolved[key]);
        }
      });

      // 📌 FIXED — Proper CV Upload
      if (formData.cv) {
        const cleanUri = formData.cv.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();

        form.append("cv", {
          uri: cleanUri,
          name: formData.cv.name || `cv.${ext}`,
          type: ext === "pdf" ? "application/pdf" : `image/${ext}`, // handles JPG CV
        });
      }

      // 📌 FIXED — Proper Image Upload
      if (formData.image) {
        const cleanUri = formData.image.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();

        form.append("image", {
          uri: cleanUri,
          name: `profile.${ext}`,
          type: `image/${ext}`,
        });
      }

      await axios.post(`${BASE_URL}/api/users/save-profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Profile Saved", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
        },
      ]);
    } catch (e) {
      console.log("Submit error:", e.response?.data || e.message);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not save profile",
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

          {/* IMAGE PICKER */}
          <Text style={styles.label}>Profile Image</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image
                source={{ uri: formData.image.uri }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={{ color: "#777", textAlign: "center" }}>
                📷{"\n"}Choose Photo
              </Text>
            )}
          </TouchableOpacity>

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

          {/* DATE */}
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
          <DropdownPicker
            label="Select Qualification"
            value={formData.qualification}
            onChange={(v) => handleChange("qualification", v)}
            options={[
              { label: "Graduate", value: "Graduate" },
              { label: "Post Graduate", value: "PG" },
              { label: "Diploma", value: "Diploma" },
              { label: "Marathi Medium", value: "Marathi Medium" },
              { label: "Other", value: "Other" },
            ]}
          />

          {/* DOMAIN */}
          <Text style={styles.label}>Domain *</Text>
          <DropdownPicker
            label="Select Domain"
            value={formData.domain}
            onChange={(v) => handleChange("domain", v)}
            options={[
              { label: "React Developer", value: "React" },
              { label: "Java Developer", value: "Java" },
              { label: "Python Developer", value: "Python" },
              { label: "Marathi Teacher", value: "Marathi Teacher" },
              { label: "Other", value: "Other" },
            ]}
          />

          {/* EXPERIENCE */}
          <Text style={styles.label}>Experience *</Text>
          <DropdownPicker
            label="Select Experience"
            value={formData.experience}
            onChange={(v) => handleChange("experience", v)}
            options={[
              { label: "Fresher", value: "Fresher" },
              { label: "1-2 Years", value: "1-2" },
              { label: "3-5 Years", value: "3-5" },
              { label: "5+ Years", value: "5+" },
              { label: "Other", value: "Other" },
            ]}
          />

          {/* CV */}
          <Text style={styles.label}>Upload CV *</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickCV}>
            <Text style={{ fontWeight: "600" }}>
              {formData.cv ? formData.cv.name : "Choose File"}
            </Text>
          </TouchableOpacity>

          {/* EXTRA EXPERT FIELDS */}
          {role === "Expert" && (
            <>
              <Text style={styles.label}>Certifications</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter certifications"
                onChangeText={(v) => handleChange("certificate", v)}
              />

              <Text style={styles.label}>Languages</Text>
              <DropdownPicker
                label="Select Language"
                value={formData.languages}
                onChange={(v) => handleChange("languages", v)}
                options={[
                  { label: "English", value: "English" },
                  { label: "Hindi", value: "Hindi" },
                  { label: "Marathi", value: "Marathi" },
                  { label: "Other", value: "Other" },
                ]}
              />

              <Text style={styles.label}>City</Text>
              <DropdownPicker
                label="Select Location"
                value={formData.location}
                onChange={(v) => handleChange("location", v)}
                options={[
                  { label: "Mumbai", value: "Mumbai" },
                  { label: "Pune", value: "Pune" },
                  { label: "Nashik", value: "Nashik" },
                  { label: "Other", value: "Other" },
                ]}
              />

              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                placeholder="Short bio"
                onChangeText={(v) => handleChange("bio", v)}
              />
            </>
          )}

          {/* SUBMIT BUTTON */}
          <TouchableOpacity style={styles.submitBtn} onPress={submitProfile}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 10,
  },
  label: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#0B2D72",
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownBox: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleRow: { flexDirection: "row", gap: 10, marginTop: 10 },
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
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "55%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B2D72",
    textAlign: "center",
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  modalItemSelected: {
    backgroundColor: "#eef3ff",
  },
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    backgroundColor: "#f3f4f6",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
});
