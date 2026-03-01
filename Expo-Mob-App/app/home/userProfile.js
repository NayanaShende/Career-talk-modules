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
import * as ImagePicker from "expo-image-picker"; // ✅ NEW
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const BASE_URL = "http://172.20.10.3:3000";

// ✅ iOS-safe dropdown component
function DropdownPicker({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}>
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
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: item.value === value ? "#0B2D72" : "#333",
                    fontWeight: item.value === value ? "700" : "400",
                  }}>
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
    image: null, // ✅ NEW
    certificate: "",
    languages: "",
    customLanguages: "",
    location: "",
    customLocation: "",
    bio: "",
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

  // ✅ NEW: Pick profile image from gallery
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert(
        "Permission required",
        "Please allow access to your photo library",
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleChange("image", result.assets[0]);
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
      if (!token)
        return Alert.alert("Error", "Session expired. Please login again.");

      // STEP 1: SET ROLE
      await axios.post(
        `${BASE_URL}/api/auth/set-role`,
        { role: role.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // STEP 2: SAVE PROFILE
      const form = new FormData();
      form.append("role", role.toLowerCase());

      // ✅ Resolve "Other" fields
      const resolvedData = {
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

      // ✅ Skip cv, image, and all custom* fields (handled separately below)
      const skipFields = [
        "cv",
        "image", // ✅ NEW
        "customLocation",
        "customDomain",
        "customQualification",
        "customExperience",
        "customLanguages",
      ];

      Object.keys(resolvedData).forEach((key) => {
        if (
          !skipFields.includes(key) &&
          resolvedData[key] !== null &&
          resolvedData[key] !== ""
        ) {
          form.append(key, resolvedData[key]);
        }
      });

      // ✅ Append CV
      if (formData.cv) {
        form.append("cv", {
          uri: formData.cv.uri,
          name: formData.cv.name || "cv.pdf",
          type: "application/pdf",
        });
      }

      // ✅ NEW: Append profile image
      if (formData.image) {
        const ext = formData.image.uri.split(".").pop();
        form.append("image", {
          uri: formData.image.uri,
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

      Alert.alert("Success", "Profile saved!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
        },
      ]);
    } catch (error) {
      console.log("Submit error:", error.response?.data || error.message);
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
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Profile Information</Text>

          {/* ✅ NEW: PROFILE IMAGE */}
          <Text style={styles.label}>Profile Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image
                source={{ uri: formData.image.uri }}
                style={styles.imagePreview}
              />
            ) : (
              <Text
                style={{ color: "#777", fontSize: 13, textAlign: "center" }}>
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
                onPress={() => setRole(item)}>
                <Text
                  style={[styles.roleText, role === item && { color: "#fff" }]}>
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
          {formData.qualification === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom qualification"
              onChangeText={(v) => handleChange("customQualification", v)}
            />
          )}

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
          {formData.domain === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom domain"
              onChangeText={(v) => handleChange("customDomain", v)}
            />
          )}

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

          {/* EXPERT ONLY FIELDS */}
          {role === "Expert" && (
            <>
              {/* CERTIFICATE */}
              <Text style={styles.label}>Certification</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter certifications"
                onChangeText={(v) => handleChange("certificate", v)}
              />

              {/* LANGUAGES */}
              <Text style={styles.label}>Languages Known</Text>
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
              {formData.languages === "Other" && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter custom language"
                  onChangeText={(v) => handleChange("customLanguages", v)}
                />
              )}

              {/* LOCATION */}
              <Text style={styles.label}>Your Location</Text>
              <DropdownPicker
                label="Select City"
                value={formData.location}
                onChange={(v) => handleChange("location", v)}
                options={[
                  { label: "Mumbai", value: "Mumbai" },
                  { label: "Pune", value: "Pune" },
                  { label: "Nashik", value: "Nashik" },
                  { label: "Other", value: "Other" },
                ]}
              />
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

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 7,
    color: "#0B2D72",
  },
  label: { marginTop: 15, fontWeight: "600", color: "#0B2D72" },
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
    alignItems: "center",
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
  roleSelected: { backgroundColor: "#0B2D72" },
  roleText: { color: "#0B2D72", fontWeight: "600" },
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
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemSelected: {
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
  },
  // ✅ NEW: Image picker styles
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#f3f4f6",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#0B2D72",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  imagePreview: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
});
