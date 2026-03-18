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

const BASE_URL = "http://192.168.1.14:3000";

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

// ─── Design Tokens ────────────────────────────────────────────────────────────
const GREEN = "#867795";
const GREEN_DARK = "#867795";
const GREEN_MID = "#867795";
const GREEN_LIGHT = "#f5ebff";
const GREEN_PALE = "#867795";
const WHITE = "#FFFFFF";
const INK = "#867795";
const MUTED = "#867795";
const MUTED2 = "#867795";
const BORDER = "#b59ccc";
const BG = "#fcf9ff";
const BG_INPUT = "#fefeff";
const RED = "#DC2626";
const RED_L = "#FFF5F5";
const GREEN_SUC = "#16A34A";
const GREEN_SUC_L = "#F0FDF4";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={s.sectionIconBox}>
          <Text style={s.sectionIcon}>{icon}</Text>
        </View>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Field label ──────────────────────────────────────────────────────────────
function Label({ text, required }) {
  return (
    <Text style={s.label}>
      {text}
      {required && <Text style={{ color: RED }}> *</Text>}
    </Text>
  );
}

// ─── Field error ──────────────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <View style={s.errRow}>
      <Ionicons name="alert-circle" size={12} color={RED} />
      <Text style={s.errText}>{message}</Text>
    </View>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function DropdownPicker({ label, value, options, onChange, error }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <TouchableOpacity
        style={[s.input, s.row, error && s.inputErr]}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: selected ? INK : MUTED2, fontSize: 15, flex: 1 }}>
          {selected ? selected.label : label}
        </Text>
        <Ionicons name="chevron-down" size={18} color={MUTED} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={s.mOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={s.mSheet}>
          <View style={s.mHandle} />
          <Text style={s.mTitle}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.mRow, item.value === value && s.mRowActive]}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={[s.mRowText, item.value === value && s.mRowTextActive]}
                >
                  {item.label}
                </Text>
                {item.value === value && (
                  <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                )}
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
  const toggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills");
      return;
    }
    onChange([...selectedSkills, skill]);
  };
  const addCustom = () => {
    const t = customSkill.trim();
    if (!t || selectedSkills.includes(t)) return;
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills");
      return;
    }
    onChange([...selectedSkills, t]);
    setCustomSkill("");
  };
  return (
    <>
      <View style={s.chipWrap}>
        {selectedSkills.length === 0 ? (
          <Text style={{ color: MUTED2, fontSize: 13 }}>
            No skills selected yet
          </Text>
        ) : (
          selectedSkills.map((sk) => (
            <TouchableOpacity
              key={sk}
              style={s.chip}
              onPress={() => toggle(sk)}
            >
              <Text style={s.chipText}>{sk}</Text>
              <Ionicons
                name="close"
                size={12}
                color={WHITE}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity style={s.dashedBtn} onPress={() => setVisible(true)}>
        <Ionicons name="add-circle-outline" size={17} color={GREEN} />
        <Text style={s.dashedBtnText}>
          {selectedSkills.length === 0 ? "Add Skills" : "Edit Skills"} (max 5)
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={s.mOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={[s.mSheet, { maxHeight: "72%" }]}>
          <View style={s.mHandle} />
          <Text style={s.mTitle}>Select Skills</Text>
          <Text style={s.mMeta}>{selectedSkills.length}/5 selected</Text>
          <View style={s.customRow}>
            <TextInput
              style={s.customInput}
              placeholder="Add custom skill…"
              placeholderTextColor={MUTED2}
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity style={s.customAddBtn} onPress={addCustom}>
              <Text style={{ color: WHITE, fontWeight: "700", fontSize: 13 }}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={SKILL_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const sel = selectedSkills.includes(item);
              return (
                <TouchableOpacity
                  style={[s.mRow, sel && s.mRowActive]}
                  onPress={() => toggle(item)}
                >
                  <Text style={[s.mRowText, sel && s.mRowTextActive]}>
                    {item}
                  </Text>
                  {sel && (
                    <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={s.doneBtn} onPress={() => setVisible(false)}>
            <Text style={s.doneBtnText}>Done</Text>
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
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, lang]);
  };
  const addCustom = () => {
    const t = customLang.trim();
    if (!t || selectedLanguages.includes(t)) return;
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, t]);
    setCustomLang("");
  };
  return (
    <>
      <View style={s.chipWrap}>
        {selectedLanguages.length === 0 ? (
          <Text style={{ color: MUTED2, fontSize: 13 }}>
            No languages selected yet
          </Text>
        ) : (
          selectedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[s.chip, { backgroundColor: GREEN_MID }]}
              onPress={() => toggle(lang)}
            >
              <Text style={s.chipText}>{lang}</Text>
              <Ionicons
                name="close"
                size={12}
                color={WHITE}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity style={s.dashedBtn} onPress={() => setVisible(true)}>
        <Ionicons name="add-circle-outline" size={17} color={GREEN} />
        <Text style={s.dashedBtnText}>
          {selectedLanguages.length === 0 ? "Add Languages" : "Edit Languages"}{" "}
          (max 5)
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={s.mOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={[s.mSheet, { maxHeight: "72%" }]}>
          <View style={s.mHandle} />
          <Text style={s.mTitle}>Select Languages</Text>
          <Text style={s.mMeta}>{selectedLanguages.length}/5 selected</Text>
          <View style={s.customRow}>
            <TextInput
              style={s.customInput}
              placeholder="Add custom language…"
              placeholderTextColor={MUTED2}
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity style={s.customAddBtn} onPress={addCustom}>
              <Text style={{ color: WHITE, fontWeight: "700", fontSize: 13 }}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={LANGUAGE_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const sel = selectedLanguages.includes(item);
              return (
                <TouchableOpacity
                  style={[s.mRow, sel && s.mRowActive]}
                  onPress={() => toggle(item)}
                >
                  <Text style={[s.mRowText, sel && s.mRowTextActive]}>
                    {item}
                  </Text>
                  {sel && (
                    <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={s.doneBtn} onPress={() => setVisible(false)}>
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Certificate upload ───────────────────────────────────────────────────────
function CertificateUpload({ domain, certFile, onPick, error }) {
  const guide = domain ? DOMAIN_CERTIFICATE_GUIDE[domain] : null;
  return (
    <View style={{ marginTop: 4 }}>
      {domain ? (
        <View style={s.certInfoBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={GREEN}
            style={{ marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.certInfoTitle}>Required for "{domain}"</Text>
            <Text style={s.certInfoText}>{guide}</Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            s.certInfoBox,
            { borderLeftColor: "#F59E0B", backgroundColor: "#FFFBEB" },
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={16}
            color="#F59E0B"
            style={{ marginTop: 2 }}
          />
          <Text style={{ fontSize: 13, color: "#92400E", flex: 1 }}>
            Select your domain first to see which certificate is required.
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[
          s.certBtn,
          certFile && s.certBtnSuccess,
          error && !certFile && s.certBtnErr,
          !domain && { opacity: 0.4 },
        ]}
        onPress={domain ? onPick : () => Alert.alert("Select domain first")}
        activeOpacity={domain ? 0.75 : 1}
      >
        <View
          style={[
            s.certIconWrap,
            certFile
              ? { backgroundColor: GREEN_SUC_L }
              : { backgroundColor: GREEN_LIGHT },
          ]}
        >
          <Ionicons
            name={certFile ? "document-attach" : "cloud-upload-outline"}
            size={22}
            color={certFile ? GREEN_SUC : error ? RED : GREEN}
          />
        </View>
        <View style={{ flex: 1 }}>
          {certFile ? (
            <>
              <Text style={s.certFileName} numberOfLines={1}>
                {certFile.name}
              </Text>
              <Text style={{ fontSize: 11, color: GREEN_SUC, marginTop: 2 }}>
                ✓ Uploaded — tap to replace
              </Text>
            </>
          ) : (
            <>
              <Text style={[s.certLabel, error && { color: RED }]}>
                Tap to upload certificate *
              </Text>
              <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                PDF, JPG, PNG accepted
              </Text>
            </>
          )}
        </View>
        {certFile && (
          <Ionicons name="checkmark-circle" size={22} color={GREEN_SUC} />
        )}
      </TouchableOpacity>
      <FieldError message={error} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [role, setRole] = useState("Jobseeker");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "",
    qualification: "",
    customQualification: "",
    experience: "",
    customExperience: "",
    cv: null,
    image: null,
    certFile: null,
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

  const handleNameChange = (value) => {
    const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
    setField("fullName", cleaned);
    if (cleaned.trim().length < 2)
      setErrors((p) => ({
        ...p,
        fullName: "Name must have at least 2 letters",
      }));
    else setErrors((p) => ({ ...p, fullName: "" }));
  };

  const handleEmailChange = (value) => {
    const lower = value.toLowerCase();
    setField("email", lower);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower))
      setErrors((p) => ({ ...p, email: "Enter a valid email address" }));
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
      Alert.alert("Error", "Could not open file picker.");
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

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2)
      e.fullName = "Full name is required (min 2 chars)";
    if (!formData.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email address";
    if (!formData.gender) e.gender = "Gender is required";
    if (!formData.dob) e.dob = "Birth date is required";
    if (!formData.qualification) e.qualification = "Qualification is required";
    else if (
      formData.qualification === "Other" &&
      !formData.customQualification.trim()
    )
      e.customQualification = "Please specify";
    if (!formData.experience) e.experience = "Experience is required";
    else if (
      formData.experience === "Other" &&
      !formData.customExperience.trim()
    )
      e.customExperience = "Please specify";
    if (!formData.cv) e.cv = "Please upload your CV";
    if (role === "Expert") {
      if (!formData.domain) e.domain = "Domain is required for Experts";
      else if (formData.domain === "Other" && !formData.customDomain.trim())
        e.customDomain = "Please specify";
      if (selectedSkills.length === 0)
        e.skills = "Please select at least 1 skill";
      if (!formData.certFile)
        e.certFile = "Certificate is required to verify your expertise";
      if (formData.location === "Other" && !formData.customLocation.trim())
        e.customLocation = "Please enter your city";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitProfile = async () => {
    if (!validate()) {
      Alert.alert(
        "Incomplete Form",
        "Please fix the highlighted fields before submitting.",
      );
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Login Required");
      await axios.post(
        `${BASE_URL}/api/auth/set-role`,
        { role: role.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const form = new FormData();
      form.append("role", role.toLowerCase());
      form.append("gender", formData.gender?.toLowerCase());
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
        isVerified: role === "Expert",
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
        "gender",
      ];
      Object.keys(resolvedData).forEach((key) => {
        if (
          !skipFields.includes(key) &&
          resolvedData[key] !== "" &&
          resolvedData[key] !== null &&
          resolvedData[key] !== undefined
        )
          form.append(key, resolvedData[key]);
      });
      if (selectedSkills.length > 0)
        form.append("skills", selectedSkills.join(", "));
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
        role === "Expert" ? "✅ Expert Profile Created!" : "✅ Profile Saved!",
        role === "Expert"
          ? "Your certificate has been uploaded and your expert profile is now active!"
          : "Your profile has been saved. Welcome to CareerTalk!",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)/dashboard/dashboard"),
          },
        ],
      );
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message ||
          "Could not save profile. Please try again.",
      );
    }
  };

  const isExpert = role === "Expert";
  const displayDomain =
    formData.domain === "Other"
      ? formData.customDomain || "Other"
      : formData.domain;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* ── HEADER ── */}
        <View style={s.topBar}>
          <View style={s.topBarInner}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>CT</Text>
            </View>
            <View>
              <Text style={s.logoName}>CareerTalk</Text>
              <Text style={s.logoTagline}>Build your future</Text>
            </View>
          </View>
          <View style={s.headerTextGroup}>
            <Text style={s.pageTitle}>
              {isExpert ? "Expert Profile" : "Jobseeker Profile"}
            </Text>
            <Text style={s.pageSub}>Fill your details to get started</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── ROLE TOGGLE ── */}
          <View style={s.roleCard}>
            <Text style={s.roleCardLabel}>I am joining as</Text>
            <View style={s.roleTabs}>
              {["Jobseeker", "Expert"].map((item) => {
                const isActive = role === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[s.roleTab, isActive && s.roleTabActive]}
                    onPress={() => setRole(item)}
                  >
                    <Text style={s.roleTabIcon}>
                      {item === "Expert" ? "🎓" : "💼"}
                    </Text>
                    <Text
                      style={[s.roleTabText, isActive && s.roleTabTextActive]}
                    >
                      {item}
                    </Text>
                    {isActive && (
                      <View style={s.roleTabCheck}>
                        <Ionicons name="checkmark" size={10} color={WHITE} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── BASIC INFO ── */}
          <Section title="Basic Information" icon="👤">
            {/* Profile image */}
            <TouchableOpacity style={s.avatarWrap} onPress={pickImage}>
              {formData.image ? (
                <Image source={{ uri: formData.image.uri }} style={s.avatar} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={GREEN} />
                  <Text style={s.avatarHint}>Add Photo</Text>
                </View>
              )}
              <View style={s.avatarBadge}>
                <Ionicons name="camera" size={12} color={WHITE} />
              </View>
            </TouchableOpacity>

            <Label text="Full Name" required />
            <TextInput
              style={[s.input, errors.fullName && s.inputErr]}
              placeholder="Enter your full name"
              placeholderTextColor={MUTED2}
              value={formData.fullName}
              onChangeText={handleNameChange}
            />
            <FieldError message={errors.fullName} />

            <Label text="Email Address" required />
            <TextInput
              style={[s.input, errors.email && s.inputErr]}
              placeholder="your@email.com"
              placeholderTextColor={MUTED2}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={handleEmailChange}
            />
            <FieldError message={errors.email} />

            <Label text="Gender" required />
            <View style={[s.genderRow, errors.gender && s.inputErr]}>
              {["male", "female", "other"].map((opt) => {
                const isActive = formData.gender === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[s.genderBtn, isActive && s.genderBtnActive]}
                    onPress={() => setField("gender", opt)}
                  >
                    <View
                      style={[
                        s.radio,
                        { borderColor: isActive ? GREEN : BORDER },
                      ]}
                    >
                      {isActive && <View style={s.radioDot} />}
                    </View>
                    <Text
                      style={[s.genderText, isActive && s.genderTextActive]}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FieldError message={errors.gender} />

            <Label text="Date of Birth" required />
            <TouchableOpacity
              style={[s.input, s.row, errors.dob && s.inputErr]}
              onPress={() => setShow(true)}
            >
              <Text
                style={{
                  color: formData.dob ? INK : MUTED2,
                  flex: 1,
                  fontSize: 15,
                }}
              >
                {formData.dob || "Select date of birth"}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={MUTED} />
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
          </Section>

          {/* ── PROFESSIONAL INFO ── */}
          <Section title="Professional Details" icon="🎯">
            <Label text="Domain / Expertise Area" required={isExpert} />
            <DropdownPicker
              label="Select Domain"
              value={formData.domain}
              onChange={(v) => {
                setField("domain", v);
                setField("certFile", null);
                setField("customDomain", "");
              }}
              options={DOMAIN_OPTIONS}
              error={errors.domain}
            />
            <FieldError message={errors.domain} />
            {formData.domain === "Other" && (
              <>
                <TextInput
                  style={[
                    s.input,
                    s.dashedInput,
                    errors.customDomain && s.inputErr,
                  ]}
                  placeholder="Specify your domain…"
                  placeholderTextColor={MUTED2}
                  value={formData.customDomain}
                  onChangeText={(v) => setField("customDomain", v)}
                />
                <FieldError message={errors.customDomain} />
              </>
            )}

            <Label text="Qualification" required />
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
              error={errors.qualification}
            />
            <FieldError message={errors.qualification} />
            {formData.qualification === "Other" && (
              <>
                <TextInput
                  style={[
                    s.input,
                    s.dashedInput,
                    errors.customQualification && s.inputErr,
                  ]}
                  placeholder="Specify qualification…"
                  placeholderTextColor={MUTED2}
                  value={formData.customQualification}
                  onChangeText={(v) => setField("customQualification", v)}
                />
                <FieldError message={errors.customQualification} />
              </>
            )}

            <Label text="Experience" required />
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
              error={errors.experience}
            />
            <FieldError message={errors.experience} />
            {formData.experience === "Other" && (
              <>
                <TextInput
                  style={[
                    s.input,
                    s.dashedInput,
                    errors.customExperience && s.inputErr,
                  ]}
                  placeholder="Enter years of experience"
                  placeholderTextColor={MUTED2}
                  keyboardType="numeric"
                  value={formData.customExperience}
                  onChangeText={(v) => setField("customExperience", v)}
                />
                <FieldError message={errors.customExperience} />
              </>
            )}

            <Label text="Upload CV" required />
            <TouchableOpacity
              style={[s.uploadBtn, errors.cv && s.uploadBtnErr]}
              onPress={pickCV}
            >
              <View
                style={[
                  s.uploadIcon,
                  formData.cv
                    ? { backgroundColor: GREEN_SUC_L }
                    : { backgroundColor: GREEN_LIGHT },
                ]}
              >
                <Ionicons
                  name={formData.cv ? "document-attach" : "document-outline"}
                  size={20}
                  color={formData.cv ? GREEN_SUC : GREEN}
                />
              </View>
              <Text
                style={[s.uploadText, formData.cv && { color: GREEN_SUC }]}
                numberOfLines={1}
              >
                {formData.cv ? formData.cv.name : "Choose CV file (PDF)"}
              </Text>
              {formData.cv ? (
                <Ionicons name="checkmark-circle" size={20} color={GREEN_SUC} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={MUTED} />
              )}
            </TouchableOpacity>
            <FieldError message={errors.cv} />
          </Section>

          {/* ══ EXPERT ONLY ══ */}
          {isExpert && (
            <>
              <Section title="Expert Skills" icon="⚡">
                <Label text="Skills" required />
                <SkillsPicker
                  selectedSkills={selectedSkills}
                  onChange={setSelectedSkills}
                />
                <FieldError message={errors.skills} />
                <Label text="Languages Known" />
                <LanguagesPicker
                  selectedLanguages={selectedLanguages}
                  onChange={setSelectedLanguages}
                />
              </Section>

              <Section title="Verification" icon="🛡️">
                <Label
                  text="Domain Certificate / Proof of Expertise"
                  required
                />
                <CertificateUpload
                  domain={displayDomain}
                  certFile={formData.certFile}
                  onPick={pickCertificate}
                  error={errors.certFile}
                />
              </Section>

              <Section title="Location & Bio" icon="📍">
                <Label text="City" />
                <DropdownPicker
                  label="Select City"
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
                        s.input,
                        s.dashedInput,
                        errors.customLocation && s.inputErr,
                      ]}
                      placeholder="Enter your city name…"
                      placeholderTextColor={MUTED2}
                      value={formData.customLocation}
                      onChangeText={(v) => setField("customLocation", v)}
                    />
                    <FieldError message={errors.customLocation} />
                  </>
                )}
                <Label text="Bio" />
                <TextInput
                  style={[s.input, { height: 90, textAlignVertical: "top" }]}
                  multiline
                  placeholder="Write a short bio about yourself…"
                  placeholderTextColor={MUTED2}
                  value={formData.bio}
                  onChangeText={(v) => setField("bio", v)}
                />
              </Section>
            </>
          )}

          {/* ── SUBMIT ── */}
          <TouchableOpacity
            style={s.submitBtn}
            onPress={submitProfile}
            activeOpacity={0.85}
          >
            <Text style={s.submitText}>
              {isExpert ? "Submit & Get Verified" : "Save Profile"}
            </Text>
            <View style={s.submitArrow}>
              <Ionicons name="arrow-forward" size={18} color={GREEN} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { paddingBottom: 40 },

  // Header
  topBar: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 12,
    fontWeight: "900",
    color: WHITE,
    letterSpacing: 0.5,
  },
  logoName: { fontSize: 18, fontWeight: "800", color: WHITE },
  logoTagline: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },
  headerTextGroup: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.3,
  },
  pageSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 3 },

  // Role card
  roleCard: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  roleCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  roleTabs: { flexDirection: "row", gap: 10 },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: BG,
    position: "relative",
  },
  roleTabActive: { backgroundColor: GREEN_LIGHT, borderColor: GREEN },
  roleTabIcon: { fontSize: 16 },
  roleTabText: { fontSize: 14, fontWeight: "700", color: MUTED },
  roleTabTextActive: { color: GREEN },
  roleTabCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },

  // Section
  section: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: GREEN_LIGHT,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: INK },

  // Avatar
  avatarWrap: { alignSelf: "center", marginBottom: 16, position: "relative" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: GREEN_PALE,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: GREEN_PALE,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  avatarHint: { fontSize: 11, fontWeight: "600", color: GREEN },
  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: WHITE,
  },

  // Inputs
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: INK,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: BG_INPUT,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: INK,
  },
  inputErr: { borderColor: RED, backgroundColor: RED_L },
  dashedInput: { marginTop: 8, borderStyle: "dashed" },
  row: { flexDirection: "row", alignItems: "center" },

  // Gender
  genderRow: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 8,
    backgroundColor: BG_INPUT,
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  genderBtnActive: { backgroundColor: GREEN_LIGHT, borderColor: GREEN },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  genderText: { fontSize: 13, color: MUTED, fontWeight: "600" },
  genderTextActive: { color: GREEN, fontWeight: "700" },

  // Error
  errRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errText: { fontSize: 12, color: RED, fontWeight: "500" },

  // Upload
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BG_INPUT,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 12,
    marginTop: 2,
  },
  uploadBtnErr: { borderColor: RED, backgroundColor: RED_L },
  uploadIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: { flex: 1, fontSize: 14, fontWeight: "600", color: INK },

  // Chips
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: BG_INPUT,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    minHeight: 48,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { color: WHITE, fontSize: 12, fontWeight: "700" },
  dashedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 10,
    borderStyle: "dashed",
  },
  dashedBtnText: { fontSize: 13, fontWeight: "700", color: GREEN },

  // Certificate
  certInfoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
    backgroundColor: GREEN_LIGHT,
    marginBottom: 10,
  },
  certInfoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: GREEN,
    marginBottom: 3,
  },
  certInfoText: { fontSize: 12, color: "#3D6B5E", lineHeight: 18 },
  certBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GREEN,
    borderStyle: "dashed",
    backgroundColor: GREEN_LIGHT,
  },
  certBtnSuccess: {
    borderStyle: "solid",
    borderColor: GREEN_SUC,
    backgroundColor: GREEN_SUC_L,
  },
  certBtnErr: {
    borderStyle: "solid",
    borderColor: RED,
    backgroundColor: RED_L,
  },
  certIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  certLabel: { fontSize: 14, fontWeight: "700", color: GREEN },
  certFileName: { fontSize: 13, fontWeight: "700", color: GREEN_SUC },

  // Modal
  mOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  mSheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "55%",
  },
  mHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: "center",
    marginBottom: 16,
  },
  mTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: INK,
    textAlign: "center",
    marginBottom: 4,
  },
  mMeta: { fontSize: 12, color: MUTED, textAlign: "center", marginBottom: 12 },
  mRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  mRowActive: { backgroundColor: GREEN_LIGHT },
  mRowText: { fontSize: 15, color: INK, fontWeight: "500" },
  mRowTextActive: { color: GREEN, fontWeight: "700" },
  customRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  customInput: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: BORDER,
    color: INK,
  },
  customAddBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  doneBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  doneBtnText: { color: WHITE, fontSize: 15, fontWeight: "800" },

  // Submit
  submitBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: 0.2,
  },
  submitArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
});
