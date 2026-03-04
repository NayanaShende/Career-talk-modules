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
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://192.168.1.17:3000";

const SKILL_OPTIONS = [
  "React",
  "React Native",
  "Node.js",
  "Python",
  "Java",
  "Angular",
  "Vue.js",
  "DevOps",
  "UI/UX Design",
  "Data Analysis",
  "Machine Learning",
  "PHP",
  "Laravel",
  "Django",
  "Flutter",
  "Marathi Teacher",
  "English Teacher",
  "Mathematics",
  "Science",
  "Other",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Punjabi",
  "Urdu",
  "Other",
];

const DOMAIN_OPTIONS = [
  { label: "Career Counseling", value: "Career Counseling" },
  { label: "Software Engineering", value: "Software Engineering" },
  { label: "Data Science & AI", value: "Data Science & AI" },
  { label: "Finance & Investment", value: "Finance & Investment" },
  { label: "Marketing & Branding", value: "Marketing & Branding" },
  { label: "Health & Wellness", value: "Health & Wellness" },
  { label: "Legal Advisory", value: "Legal Advisory" },
  { label: "Business Strategy", value: "Business Strategy" },
  { label: "Education & Tutoring", value: "Education & Tutoring" },
  { label: "Human Resources", value: "Human Resources" },
];

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
                    fontWeight: item.value === value ? "700" : "400",
                    color: item.value === value ? "#0B2D72" : "#333",
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

function SkillsPicker({ selectedSkills, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 5) {
        Alert.alert("Max 5 skills", "You can select up to 5 skills");
        return;
      }
      onChange([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (selectedSkills.includes(trimmed)) {
      Alert.alert("Already added", "This skill is already selected");
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills", "You can select up to 5 skills");
      return;
    }
    onChange([...selectedSkills, trimmed]);
    setCustomSkill("");
  };

  return (
    <>
      <View style={styles.selectedSkillsContainer}>
        {selectedSkills.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No skills selected
          </Text>
        ) : (
          selectedSkills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={styles.skillChip}
              onPress={() => toggleSkill(skill)}>
              <Text style={styles.skillChipText}>{skill}</Text>
              <Ionicons
                name="close"
                size={14}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.addSkillsBtn}
        onPress={() => setVisible(true)}>
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addSkillsBtnText}>
          {selectedSkills.length === 0 ? "Add Skills" : "Edit Skills"} (max 5)
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={[styles.modalBox, { maxHeight: "70%" }]}>
          <Text style={styles.modalTitle}>Select Skills (max 5)</Text>
          <Text
            style={{
              color: "#888",
              textAlign: "center",
              marginBottom: 10,
              fontSize: 13,
            }}>
            {selectedSkills.length}/5 selected
          </Text>
          <View style={styles.customSkillRow}>
            <TextInput
              style={styles.customSkillInput}
              placeholder="Add custom skill..."
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={styles.customSkillAddBtn}
              onPress={addCustomSkill}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SKILL_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedSkills.includes(item);
              return (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => toggleSkill(item)}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#0B2D72" : "#333",
                        fontWeight: isSelected ? "700" : "400",
                      }}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#0B2D72"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.submitBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}>
            <Text style={styles.submitText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

function LanguagesPicker({ selectedLanguages, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      onChange(selectedLanguages.filter((l) => l !== lang));
    } else {
      if (selectedLanguages.length >= 5) {
        Alert.alert("Max 5 languages", "You can select up to 5 languages");
        return;
      }
      onChange([...selectedLanguages, lang]);
    }
  };

  const addCustomLanguage = () => {
    const trimmed = customLang.trim();
    if (!trimmed) return;
    if (selectedLanguages.includes(trimmed)) {
      Alert.alert("Already added", "This language is already selected");
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages", "You can select up to 5 languages");
      return;
    }
    onChange([...selectedLanguages, trimmed]);
    setCustomLang("");
  };

  return (
    <>
      <View style={styles.selectedSkillsContainer}>
        {selectedLanguages.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No languages selected
          </Text>
        ) : (
          selectedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.skillChip}
              onPress={() => toggleLanguage(lang)}>
              <Text style={styles.skillChipText}>{lang}</Text>
              <Ionicons
                name="close"
                size={14}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.addSkillsBtn}
        onPress={() => setVisible(true)}>
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addSkillsBtnText}>
          {selectedLanguages.length === 0 ? "Add Languages" : "Edit Languages"}{" "}
          (max 5)
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={[styles.modalBox, { maxHeight: "70%" }]}>
          <Text style={styles.modalTitle}>Select Languages (max 5)</Text>
          <Text
            style={{
              color: "#888",
              textAlign: "center",
              marginBottom: 10,
              fontSize: 13,
            }}>
            {selectedLanguages.length}/5 selected
          </Text>
          <View style={styles.customSkillRow}>
            <TextInput
              style={styles.customSkillInput}
              placeholder="Add custom language..."
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity
              style={styles.customSkillAddBtn}
              onPress={addCustomLanguage}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGE_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedLanguages.includes(item);
              return (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => toggleLanguage(item)}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#0B2D72" : "#333",
                        fontWeight: isSelected ? "700" : "400",
                      }}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#0B2D72"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.submitBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}>
            <Text style={styles.submitText}>Done</Text>
          </TouchableOpacity>
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
    domain: "",
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const handleChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

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

  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      handleChange("cv", result.assets[0]);
    }
  };

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) {
      return Alert.alert("Permission Required", "Enable gallery access.");
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
        return Alert.alert("Missing", "Full name is required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return Alert.alert("Invalid Email");
      if (!formData.dob) return Alert.alert("Missing", "Select birth date");
      if (!formData.qualification)
        return Alert.alert("Missing", "Select qualification");
      if (!formData.experience)
        return Alert.alert("Missing", "Select experience");
      if (!formData.cv) return Alert.alert("Missing", "Upload your CV");
      if (role === "Expert" && selectedSkills.length === 0)
        return Alert.alert("Missing", "Please select at least 1 skill");
      if (role === "Expert" && !formData.domain)
        return Alert.alert("Missing", "Please select your domain");

      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Login Required");

      // STEP 1: SET ROLE
      await axios.post(
        `${BASE_URL}/api/auth/set-role`,
        { role: role.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // STEP 2: BUILD FORM DATA
      const form = new FormData();
      form.append("role", role.toLowerCase());

      // ✅ FIXED: renamed resolved → resolvedData, skip → skipFields
      const resolvedData = {
        ...formData,
        location:
          formData.location === "Other"
            ? formData.customLocation
            : formData.location,
        qualification:
          formData.qualification === "Other"
            ? formData.customQualification
            : formData.qualification,
        experience:
          formData.experience === "Other"
            ? formData.customExperience
            : formData.experience,
        languages:
          selectedLanguages.length > 0
            ? selectedLanguages.join(", ")
            : formData.languages === "Other"
              ? formData.customLanguages
              : formData.languages,
        domain: formData.domain || null,
      };

      const skipFields = [
        "cv",
        "image",
        "customLocation",
        "customQualification",
        "customExperience",
        "customLanguages",
      ];

      // ✅ FIXED: was Object.keys(resolved) → now Object.keys(resolvedData)
      Object.keys(resolvedData).forEach((key) => {
        if (
          !skipFields.includes(key) &&
          resolvedData[key] !== "" &&
          resolvedData[key] !== null
        ) {
          form.append(key, resolvedData[key]);
        }
      });

      // ✅ Append skills
      if (selectedSkills.length > 0) {
        form.append("skills", selectedSkills.join(", "));
      }

      if (formData.cv) {
        const cleanUri = formData.cv.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        form.append("cv", {
          uri: cleanUri,
          name: formData.cv.name || `cv.${ext}`,
          type: ext === "pdf" ? "application/pdf" : `image/${ext}`,
        });
      }

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

      // ✅ Update AsyncStorage with new role so socket works
      const userStr = await AsyncStorage.getItem("user");
      const existingUser = userStr ? JSON.parse(userStr) : {};
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          role: role.toLowerCase(),
          hasProfile: true,
        }),
      );

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
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Profile Information</Text>

          {/* PROFILE IMAGE */}
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

          {/* EXPERIENCE */}
          <Text style={styles.label}>Experience *</Text>
          <DropdownPicker
            label="Select Experience"
            value={formData.experience}
            onChange={(v) => handleChange("experience", v)}
            options={[
              { label: "Fresher", value: "0" },
              { label: "1 Year", value: "1" },
              { label: "2 Years", value: "2" },
              { label: "3 Years", value: "3" },
              { label: "5 Years", value: "5" },
              { label: "8+ Years", value: "8" },
              { label: "Other", value: "Other" },
            ]}
          />
          {formData.experience === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter years of experience"
              keyboardType="numeric"
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
              {/* DOMAIN */}
              <Text style={styles.label}>Domain * (Your Expertise Area)</Text>
              <DropdownPicker
                label="Select Domain"
                value={formData.domain}
                onChange={(v) => handleChange("domain", v)}
                options={DOMAIN_OPTIONS}
              />

              {/* SKILLS */}
              <Text style={styles.label}>Skills * (select up to 5)</Text>
              <SkillsPicker
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
              />

              {/* CERTIFICATE */}
              <Text style={styles.label}>Certification</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter certifications"
                onChangeText={(v) => handleChange("certificate", v)}
              />

              {/* LANGUAGES */}
              <Text style={styles.label}>Languages Known</Text>
              <LanguagesPicker
                selectedLanguages={selectedLanguages}
                onChange={setSelectedLanguages}
              />

              {/* LOCATION */}
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

              {/* BIO */}
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                placeholder="Short bio"
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
    color: "#0B2D72",
    marginBottom: 10,
  },
  label: { marginTop: 15, fontSize: 16, fontWeight: "600", color: "#0B2D72" },
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
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
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
  modalItemSelected: { backgroundColor: "#f0f4ff", borderRadius: 8 },
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
  imagePreview: { width: 110, height: 110, borderRadius: 55 },
  selectedSkillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    minHeight: 40,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillChipText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  addSkillsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#0B2D72",
    borderRadius: 8,
    borderStyle: "dashed",
    justifyContent: "center",
  },
  addSkillsBtnText: { color: "#0B2D72", fontWeight: "600" },
  customSkillRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  customSkillInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  customSkillAddBtn: {
    backgroundColor: "#0B2D72",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
});
