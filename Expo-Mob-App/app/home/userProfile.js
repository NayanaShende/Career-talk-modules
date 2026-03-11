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

const BASE_URL = "http://192.168.1.26:3000";

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
  { label: "Other", value: "Other" },
];

// Per-domain certificate guidance shown to the expert
const DOMAIN_CERTIFICATE_GUIDE = {
  "Career Counseling":
    "Upload your Certified Career Counselor (CCC), NCDA certificate, or a relevant degree/diploma certificate (PDF or image).",
  "Software Engineering":
    "Upload your AWS / Google / Microsoft certification, or your CS/IT degree certificate (PDF or image).",
  "Data Science & AI":
    "Upload your IBM Data Science, Coursera ML, or university degree certificate in Data Science/AI (PDF or image).",
  "Finance & Investment":
    "Upload your CFA, CFP, CA, MBA-Finance marksheet, SEBI/NISM certificate (PDF or image).",
  "Marketing & Branding":
    "Upload your Google Digital Marketing, HubSpot, or MBA-Marketing degree certificate (PDF or image).",
  "Health & Wellness":
    "Upload your MBBS, BDS, BSc Nursing, Physiotherapy, or certified trainer/dietitian certificate (PDF or image).",
  "Legal Advisory":
    "Upload your LLB/LLM degree or Bar Council Enrollment certificate (PDF or image).",
  "Business Strategy":
    "Upload your MBA degree, CMC certification, or Business Strategy programme certificate (PDF or image).",
  "Education & Tutoring":
    "Upload your B.Ed/M.Ed degree, TET/CTET scorecard, or school-affiliation proof (PDF or image).",
  "Human Resources":
    "Upload your SHRM-CP, PHR, MBA-HR, or XLRI/TISS HR programme certificate (PDF or image).",
  Other:
    "Upload any official certificate, degree, or document that proves your expertise in your domain (PDF or image).",
};

// ─── Reusable dropdown ────────────────────────────────────────────────────────
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

// ─── Skills picker ────────────────────────────────────────────────────────────
function SkillsPicker({ selectedSkills, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 5) {
        Alert.alert("Max 5 skills");
        return;
      }
      onChange([...selectedSkills, skill]);
    }
  };

  const addCustom = () => {
    const t = customSkill.trim();
    if (!t) return;
    if (selectedSkills.includes(t)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills");
      return;
    }
    onChange([...selectedSkills, t]);
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
              onPress={() => toggleSkill(skill)}
            >
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
        onPress={() => setVisible(true)}
      >
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
            }}
          >
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
              onPress={addCustom}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SKILL_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSel = selectedSkills.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSel && styles.modalItemSelected]}
                  onPress={() => toggleSkill(item)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSel ? "#0B2D72" : "#333",
                        fontWeight: isSel ? "700" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {isSel && (
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
            onPress={() => setVisible(false)}
          >
            <Text style={styles.submitText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Languages picker ─────────────────────────────────────────────────────────
function LanguagesPicker({ selectedLanguages, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const toggle = (lang) => {
    if (selectedLanguages.includes(lang)) {
      onChange(selectedLanguages.filter((l) => l !== lang));
    } else {
      if (selectedLanguages.length >= 5) {
        Alert.alert("Max 5 languages");
        return;
      }
      onChange([...selectedLanguages, lang]);
    }
  };

  const addCustom = () => {
    const t = customLang.trim();
    if (!t) return;
    if (selectedLanguages.includes(t)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, t]);
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
              onPress={() => toggle(lang)}
            >
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
        onPress={() => setVisible(true)}
      >
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
            }}
          >
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
              onPress={addCustom}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGE_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSel = selectedLanguages.includes(item);
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSel && styles.modalItemSelected]}
                  onPress={() => toggle(item)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSel ? "#0B2D72" : "#333",
                        fontWeight: isSel ? "700" : "400",
                      }}
                    >
                      {item}
                    </Text>
                    {isSel && (
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
            onPress={() => setVisible(false)}
          >
            <Text style={styles.submitText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Inline field error ───────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 4,
      }}
    >
      <Ionicons name="alert-circle" size={13} color="#e53935" />
      <Text style={styles.fieldError}>{message}</Text>
    </View>
  );
}

// ─── Certificate upload section (domain-aware) ────────────────────────────────
function CertificateUploadSection({ domain, certFile, onPick, error }) {
  const guide = domain ? DOMAIN_CERTIFICATE_GUIDE[domain] : null;
  return (
    <View style={{ marginTop: 6 }}>
      {/* Instruction box */}
      {domain ? (
        <View style={styles.certInfoBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#0B2D72"
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.certInfoTitle}>
              {`Required proof for "${domain}"`}
            </Text>
            <Text style={styles.certInfoText}>{guide}</Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.certInfoBox,
            { borderLeftColor: "#e07b00", backgroundColor: "#fff8ee" },
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={18}
            color="#e07b00"
            style={{ marginTop: 2 }}
          />
          <Text style={[styles.certInfoText, { color: "#e07b00", flex: 1 }]}>
            Please select your domain first — the required certificate type will
            appear here.
          </Text>
        </View>
      )}

      {/* Upload button */}
      <TouchableOpacity
        style={[
          styles.certUploadBtn,
          certFile && styles.certUploadBtnSuccess,
          error && !certFile && styles.certUploadBtnError,
          !domain && { opacity: 0.45 },
        ]}
        onPress={
          domain
            ? onPick
            : () =>
                Alert.alert(
                  "Select domain first",
                  "Please choose your domain before uploading a certificate.",
                )
        }
        activeOpacity={domain ? 0.7 : 1}
      >
        <Ionicons
          name={certFile ? "document-attach" : "cloud-upload-outline"}
          size={24}
          color={certFile ? "#1a7f37" : error ? "#e53935" : "#0B2D72"}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          {certFile ? (
            <>
              <Text style={styles.certFileNameText} numberOfLines={1}>
                {certFile.name}
              </Text>
              <Text style={{ fontSize: 11, color: "#1a7f37", marginTop: 2 }}>
                ✓ Certificate uploaded — tap to replace
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[styles.certUploadLabel, error && { color: "#e53935" }]}
              >
                Tap to upload certificate *
              </Text>
              <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                Accepted: PDF, JPG, PNG
              </Text>
            </>
          )}
        </View>
        {certFile && (
          <Ionicons name="checkmark-circle" size={24} color="#1a7f37" />
        )}
      </TouchableOpacity>
      <FieldError message={error} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [role, setRole] = useState("Jobseeker");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

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
    certFile: null,
    languages: "",
    customLanguages: "",
    location: "",
    customLocation: "",
    bio: "",
    domain: "",
    customDomain: "",
  });

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Name — letters + spaces only, strip everything else
  const handleNameChange = (value) => {
    const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
    setField("fullName", cleaned);
    if (cleaned.trim().length < 2)
      setErrors((p) => ({
        ...p,
        fullName: "Name must have at least 2 letters (letters only)",
      }));
    else setErrors((p) => ({ ...p, fullName: "" }));
  };

  // Email — force lowercase + format validation
  const handleEmailChange = (value) => {
    const lower = value.toLowerCase();
    setField("email", lower);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower))
      setErrors((p) => ({
        ...p,
        email: "Enter a valid email (no capital letters allowed)",
      }));
    else setErrors((p) => ({ ...p, email: "" }));
  };

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
    setField("dob", formatted);
  };

  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) setField("cv", result.assets[0]);
  };

  // Certificate: PDF or image only
  const pickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setField("certFile", result.assets[0]);
        setErrors((p) => ({ ...p, certFile: "" }));
      }
    } catch {
      Alert.alert("Error", "Could not open file picker. Please try again.");
    }
  };

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted)
      return Alert.alert("Permission Required", "Enable gallery access.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setField("image", result.assets[0]);
  };

  // ── Full validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2)
      e.fullName = "Full name is required (letters only, min 2 chars)";
    else if (/[^a-zA-Z\s]/.test(formData.fullName))
      e.fullName = "Name must contain letters only";

    if (!formData.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email address";

    if (!formData.dob) e.dob = "Birth date is required";

    if (!formData.qualification) e.qualification = "Qualification is required";
    else if (
      formData.qualification === "Other" &&
      !formData.customQualification.trim()
    )
      e.customQualification = "Please specify your qualification";

    if (!formData.experience) e.experience = "Experience is required";
    else if (
      formData.experience === "Other" &&
      !formData.customExperience.trim()
    )
      e.customExperience = "Please specify your experience";

    if (!formData.cv) e.cv = "Please upload your CV";

    if (role === "Expert") {
      if (!formData.domain) e.domain = "Domain is required for Experts";
      else if (formData.domain === "Other" && !formData.customDomain.trim())
        e.customDomain = "Please specify your domain";

      if (selectedSkills.length === 0)
        e.skills = "Please select at least 1 skill";

      if (!formData.certFile)
        e.certFile =
          "Please upload your certificate — this is required to verify your domain expertise";

      if (formData.location === "Other" && !formData.customLocation.trim())
        e.customLocation = "Please specify your city";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submitProfile = async () => {
    if (!validate()) {
      Alert.alert(
        "Validation Error",
        "Please fix the highlighted fields before submitting.",
      );
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Login Required");

      // Set role
      await axios.post(
        `${BASE_URL}/api/auth/set-role`,
        { role: role.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const form = new FormData();
      form.append("role", role.toLowerCase());

      const resolvedDomain =
        formData.domain === "Other" ? formData.customDomain : formData.domain;

      const resolvedData = {
        ...formData,
        domain: resolvedDomain || null,
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
            : formData.languages,
        // Auto-approve on submit
        isVerified: role === "Expert" ? true : false,
        verificationStatus: role === "Expert" ? "approved" : "none",
      };

      const skipFields = [
        "cv",
        "image",
        "certFile",
        "customLocation",
        "customQualification",
        "customExperience",
        "customLanguages",
        "customDomain",
      ];

      Object.keys(resolvedData).forEach((key) => {
        if (
          !skipFields.includes(key) &&
          resolvedData[key] !== "" &&
          resolvedData[key] !== null &&
          resolvedData[key] !== undefined
        ) {
          form.append(key, resolvedData[key]);
        }
      });

      if (selectedSkills.length > 0)
        form.append("skills", selectedSkills.join(", "));

      // CV
      if (formData.cv) {
        const cleanUri = formData.cv.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        form.append("cv", {
          uri: cleanUri,
          name: formData.cv.name || `cv.${ext}`,
          type: ext === "pdf" ? "application/pdf" : `image/${ext}`,
        });
      }

      // Profile image
      if (formData.image) {
        const cleanUri = formData.image.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        form.append("image", {
          uri: cleanUri,
          name: `profile.${ext}`,
          type: `image/${ext}`,
        });
      }

      // Certificate (expert only) — tells backend which domain this cert belongs to
      if (role === "Expert" && formData.certFile) {
        const cleanUri = formData.certFile.uri.split("?")[0];
        const ext = cleanUri.split(".").pop().toLowerCase();
        const mimeMap = {
          pdf: "application/pdf",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
        };
        form.append("certificate", {
          uri: cleanUri,
          name: formData.certFile.name || `certificate.${ext}`,
          type: mimeMap[ext] || "application/octet-stream",
        });
        form.append("certificateDomain", resolvedDomain);
      }

      await axios.post(`${BASE_URL}/api/users/save-profile`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local storage
      const userStr = await AsyncStorage.getItem("user");
      const existingUser = userStr ? JSON.parse(userStr) : {};
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          role: role.toLowerCase(),
          hasProfile: true,
          isVerified: role === "Expert",
        }),
      );

      Alert.alert(
        role === "Expert" ? "✅ Profile Verified & Saved" : "✅ Profile Saved",
        role === "Expert"
          ? "Your certificate has been uploaded and your expert profile is now verified!"
          : "Your profile has been saved successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
          },
        ],
      );
    } catch (e) {
      console.log("Submit error:", e.response?.data || e.message);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Could not save profile",
      );
    }
  };

  // Resolved display domain (for passing to CertificateUploadSection)
  const displayDomain =
    formData.domain === "Other"
      ? formData.customDomain || "Other"
      : formData.domain;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Profile Information</Text>

          {/* ── Profile image ── */}
          <Text style={styles.label}>Profile Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {formData.image ? (
              <Image
                source={{ uri: formData.image.uri }}
                style={styles.imagePreview}
              />
            ) : (
              <Text
                style={{ color: "#777", fontSize: 13, textAlign: "center" }}
              >
                📷{"\n"}Choose Photo
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Role toggle ── */}
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

          {/* ── Full name ── */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Enter full name (letters only)"
            value={formData.fullName}
            onChangeText={handleNameChange}
          />
          <FieldError message={errors.fullName} />

          {/* ── Email ── */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter email (lowercase only)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={handleEmailChange}
          />
          <FieldError message={errors.email} />

          {/* ── DOB ── */}
          <Text style={styles.label}>Birth Date *</Text>
          <TouchableOpacity
            style={[styles.input, errors.dob && styles.inputError]}
            onPress={() => setShow(true)}
          >
            <Text style={{ color: formData.dob ? "#000" : "#777" }}>
              {formData.dob || "Select Birth Date"}
            </Text>
          </TouchableOpacity>
          <FieldError message={errors.dob} />
          {show && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

          {/* ── Domain (with Other option) ── */}
          <Text style={styles.label}>Domain * (Your Expertise Area)</Text>
          <DropdownPicker
            label="Select Domain"
            value={formData.domain}
            onChange={(v) => {
              setField("domain", v);
              setField("certFile", null); // reset cert when domain changes
              setField("customDomain", "");
            }}
            options={DOMAIN_OPTIONS}
          />
          <FieldError message={errors.domain} />
          {formData.domain === "Other" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.otherInput,
                  errors.customDomain && styles.inputError,
                ]}
                placeholder="Please specify your domain..."
                value={formData.customDomain}
                onChangeText={(v) => setField("customDomain", v)}
              />
              <FieldError message={errors.customDomain} />
            </>
          )}

          {/* ── Qualification ── */}
          <Text style={styles.label}>Qualification *</Text>
          <DropdownPicker
            label="Select Qualification"
            value={formData.qualification}
            onChange={(v) => setField("qualification", v)}
            options={[
              { label: "Graduate", value: "Graduate" },
              { label: "Post Graduate", value: "PG" },
              { label: "Diploma", value: "Diploma" },
              { label: "Marathi Medium", value: "Marathi Medium" },
              { label: "Other", value: "Other" },
            ]}
          />
          <FieldError message={errors.qualification} />
          {formData.qualification === "Other" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.otherInput,
                  errors.customQualification && styles.inputError,
                ]}
                placeholder="Please specify your qualification..."
                value={formData.customQualification}
                onChangeText={(v) => setField("customQualification", v)}
              />
              <FieldError message={errors.customQualification} />
            </>
          )}

          {/* ── Experience ── */}
          <Text style={styles.label}>Experience *</Text>
          <DropdownPicker
            label="Select Experience"
            value={formData.experience}
            onChange={(v) => setField("experience", v)}
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
          <FieldError message={errors.experience} />
          {formData.experience === "Other" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  styles.otherInput,
                  errors.customExperience && styles.inputError,
                ]}
                placeholder="Enter years of experience"
                keyboardType="numeric"
                value={formData.customExperience}
                onChangeText={(v) => setField("customExperience", v)}
              />
              <FieldError message={errors.customExperience} />
            </>
          )}

          {/* ── CV ── */}
          <Text style={styles.label}>Upload CV *</Text>
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              errors.cv && { borderWidth: 1.5, borderColor: "#e53935" },
            ]}
            onPress={pickCV}
          >
            <Ionicons
              name="document-outline"
              size={18}
              color="#0B2D72"
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontWeight: "600", flex: 1 }} numberOfLines={1}>
              {formData.cv ? formData.cv.name : "Choose CV file (PDF)"}
            </Text>
            {formData.cv && (
              <Ionicons name="checkmark-circle" size={18} color="#1a7f37" />
            )}
          </TouchableOpacity>
          <FieldError message={errors.cv} />

          {/* ══ EXPERT ONLY ══════════════════════════════════════════ */}
          {role === "Expert" && (
            <>
              {/* ── Skills ── */}
              <Text style={styles.label}>Skills * (select up to 5)</Text>
              <SkillsPicker
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
              />
              <FieldError message={errors.skills} />

              {/* ── Certificate upload — domain aware ── */}
              <Text style={styles.label}>
                Domain Certificate / Proof of Expertise *
              </Text>
              <CertificateUploadSection
                domain={displayDomain}
                certFile={formData.certFile}
                onPick={pickCertificate}
                error={errors.certFile}
              />

              {/* ── Languages ── */}
              <Text style={styles.label}>Languages Known</Text>
              <LanguagesPicker
                selectedLanguages={selectedLanguages}
                onChange={setSelectedLanguages}
              />

              {/* ── City ── */}
              <Text style={styles.label}>City</Text>
              <DropdownPicker
                label="Select Location"
                value={formData.location}
                onChange={(v) => setField("location", v)}
                options={[
                  { label: "Mumbai", value: "Mumbai" },
                  { label: "Pune", value: "Pune" },
                  { label: "Nashik", value: "Nashik" },
                  { label: "Nagpur", value: "Nagpur" },
                  { label: "Aurangabad", value: "Aurangabad" },
                  { label: "Other", value: "Other" },
                ]}
              />
              {formData.location === "Other" && (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      styles.otherInput,
                      errors.customLocation && styles.inputError,
                    ]}
                    placeholder="Please enter your city name..."
                    value={formData.customLocation}
                    onChangeText={(v) => setField("customLocation", v)}
                  />
                  <FieldError message={errors.customLocation} />
                </>
              )}

              {/* ── Bio ── */}
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                placeholder="Short bio about yourself..."
                onChangeText={(v) => setField("bio", v)}
              />
            </>
          )}

          {/* ── Submit ── */}
          <TouchableOpacity style={styles.submitBtn} onPress={submitProfile}>
            <Text style={styles.submitText}>
              {role === "Expert" ? "Submit & Get Verified ✓" : "Submit"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
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
  inputError: {
    borderWidth: 1.5,
    borderColor: "#e53935",
    backgroundColor: "#fff5f5",
  },
  otherInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#0B2D72",
    borderStyle: "dashed",
    backgroundColor: "#f0f4ff",
  },
  fieldError: { color: "#e53935", fontSize: 12 },
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
    flexDirection: "row",
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
  // Certificate
  certInfoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0B2D72",
    marginBottom: 10,
  },
  certInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 3,
  },
  certInfoText: { fontSize: 13, color: "#444", lineHeight: 19 },
  certUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0B2D72",
    borderStyle: "dashed",
    backgroundColor: "#f8faff",
  },
  certUploadBtnSuccess: {
    borderStyle: "solid",
    borderColor: "#1a7f37",
    backgroundColor: "#f0fff4",
  },
  certUploadBtnError: {
    borderStyle: "solid",
    borderColor: "#e53935",
    backgroundColor: "#fff5f5",
  },
  certUploadLabel: { fontSize: 15, fontWeight: "600", color: "#0B2D72" },
  certFileNameText: { fontSize: 14, fontWeight: "600", color: "#1a7f37" },
});
