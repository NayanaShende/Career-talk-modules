import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "http://192.168.1.25:3000";

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#e9def5";
const TEAL_MID = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#e5e7eb";
const INPUT_BG = "#f8fafa";

// ── Options (unchanged) ────────────────────────────────────────────────────
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

const QUALIFICATION_OPTIONS = [
  { label: "Graduate", value: "Graduate" },
  { label: "Post Graduate", value: "PG" },
  { label: "Diploma", value: "Diploma" },
  { label: "Marathi Medium", value: "Marathi Medium" },
  { label: "Other", value: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: "0" },
  { label: "1 Year", value: "1" },
  { label: "2 Years", value: "2" },
  { label: "3 Years", value: "3" },
  { label: "5 Years", value: "5" },
  { label: "8+ Years", value: "8" },
];

const LOCATION_OPTIONS = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Pune", value: "Pune" },
  { label: "Nashik", value: "Nashik" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Other", value: "Other" },
];

// ─── Dropdown Picker ──────────────────────────────────────────────────────────
function DropdownPicker({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: selected ? TEXT_1 : TEXT_2,
            fontSize: 15,
            fontWeight: selected ? "500" : "400",
          }}
        >
          {selected ? selected.label : `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={TEXT_2} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={modalStyles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  modalStyles.item,
                  item.value === value && modalStyles.itemSelected,
                ]}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    modalStyles.itemText,
                    item.value === value && modalStyles.itemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {item.value === value && (
                  <Ionicons name="checkmark-circle" size={20} color={TEAL} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

// ─── Skills Picker ────────────────────────────────────────────────────────────
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
      Alert.alert("Already added");
      return;
    }
    if (selectedSkills.length >= 5) {
      Alert.alert("Max 5 skills");
      return;
    }
    onChange([...selectedSkills, trimmed]);
    setCustomSkill("");
  };

  return (
    <>
      <View style={styles.chipsWrap}>
        {selectedSkills.length === 0 ? (
          <Text style={styles.chipsEmpty}>No skills selected</Text>
        ) : (
          selectedSkills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={styles.chip}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={styles.chipText}>{skill}</Text>
              <Ionicons
                name="close"
                size={13}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.addChipBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={17} color={TEAL} />
        <Text style={styles.addChipText}>
          {selectedSkills.length === 0 ? "Add Skills" : "Edit Skills"} (max 5)
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={modalStyles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={[modalStyles.sheet, { maxHeight: "70%" }]}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Select Skills (max 5)</Text>
          <Text style={modalStyles.subtitle}>
            {selectedSkills.length}/5 selected
          </Text>
          <View style={modalStyles.customRow}>
            <TextInput
              style={modalStyles.customInput}
              placeholder="Add custom skill..."
              placeholderTextColor={TEXT_2}
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={modalStyles.customAddBtn}
              onPress={addCustomSkill}
            >
              <Text style={modalStyles.customAddText}>Add</Text>
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
                    modalStyles.item,
                    isSelected && modalStyles.itemSelected,
                  ]}
                  onPress={() => toggleSkill(item)}
                >
                  <Text
                    style={[
                      modalStyles.itemText,
                      isSelected && modalStyles.itemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={TEAL} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={modalStyles.doneBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={modalStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Languages Picker ─────────────────────────────────────────────────────────
function LanguagesPicker({ selectedLanguages, onChange }) {
  const [visible, setVisible] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const toggleLanguage = (lang) => {
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

  const addCustomLanguage = () => {
    const trimmed = customLang.trim();
    if (!trimmed) return;
    if (selectedLanguages.includes(trimmed)) {
      Alert.alert("Already added");
      return;
    }
    if (selectedLanguages.length >= 5) {
      Alert.alert("Max 5 languages");
      return;
    }
    onChange([...selectedLanguages, trimmed]);
    setCustomLang("");
  };

  return (
    <>
      <View style={styles.chipsWrap}>
        {selectedLanguages.length === 0 ? (
          <Text style={styles.chipsEmpty}>No languages selected</Text>
        ) : (
          selectedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.chip}
              onPress={() => toggleLanguage(lang)}
            >
              <Text style={styles.chipText}>{lang}</Text>
              <Ionicons
                name="close"
                size={13}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.addChipBtn}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={17} color={TEAL} />
        <Text style={styles.addChipText}>
          {selectedLanguages.length === 0 ? "Add Languages" : "Edit Languages"}{" "}
          (max 5)
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={modalStyles.overlay}
          onPress={() => setVisible(false)}
        />
        <View style={[modalStyles.sheet, { maxHeight: "70%" }]}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Select Languages (max 5)</Text>
          <Text style={modalStyles.subtitle}>
            {selectedLanguages.length}/5 selected
          </Text>
          <View style={modalStyles.customRow}>
            <TextInput
              style={modalStyles.customInput}
              placeholder="Add custom language..."
              placeholderTextColor={TEXT_2}
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity
              style={modalStyles.customAddBtn}
              onPress={addCustomLanguage}
            >
              <Text style={modalStyles.customAddText}>Add</Text>
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
                    modalStyles.item,
                    isSelected && modalStyles.itemSelected,
                  ]}
                  onPress={() => toggleLanguage(item)}
                >
                  <Text
                    style={[
                      modalStyles.itemText,
                      isSelected && modalStyles.itemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={TEAL} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={modalStyles.doneBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={modalStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ─── Reusable Field Label ─────────────────────────────────────────────────────
const FieldLabel = ({ text }) => <Text style={styles.fieldLabel}>{text}</Text>;

// ─── Reusable Input Field ─────────────────────────────────────────────────────
function InputField({
  label,
  value,
  field,
  setForm,
  form,
  keyboardType,
  placeholder,
  editable = true,
}) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel text={label} />
      <TextInput
        value={value}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
        style={[styles.input, !editable && styles.inputDisabled]}
        keyboardType={keyboardType || "default"}
        placeholder={placeholder || ""}
        placeholderTextColor={TEXT_2}
        editable={editable}
      />
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>
      <Ionicons name={icon} size={16} color="#fff" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const EditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    domain: "",
    qualification: "",
    experience: "",
    dob: "",
    skills: "",
    preferred_job_role: "",
    current_status: "",
    expertise: "",
    years_of_experience: "",
    linkedin: "",
    bio: "",
    location: "",
    certification: "",
    image_file: null,
    image_url: "",
    cv_file: null,
    existing_cv: "",
  });

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Fetch Profile ────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user;
      const expertRole = user?.role === "expert";
      setIsExpert(expertRole);

      setForm((prev) => ({
        ...prev,
        full_name: user.full_name || user.fullName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        domain: user.domain || "",
        qualification: user.qualification || "",
        experience: user.experience != null ? String(user.experience) : "",
        dob: user.dob || "",
        skills: user.skills || "",
        preferred_job_role: user.preferred_job_role || "",
        current_status: user.current_status || "",
        expertise: user.expertise || "",
        years_of_experience: user.years_of_experience || "",
        linkedin: user.linkedin || "",
        image_file: null,
        image_url: user.image ? `${BASE_URL}/uploads/${user.image}` : "",
        existing_cv: user.cvFile || user.cv || "",
      }));

      if (expertRole) {
        try {
          const expertRes = await axios.get(
            `${BASE_URL}/api/experts/profile/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const ep = expertRes.data.data;
          if (ep) {
            setForm((prev) => ({
              ...prev,
              full_name: ep.name || prev.full_name,
              domain: ep.domain || prev.domain,
              experience:
                ep.experience != null ? String(ep.experience) : prev.experience,
              bio: ep.bio || "",
              location: ep.location || "",
              certification: ep.certification || "",
              expertise: ep.domain || prev.expertise,
              years_of_experience:
                ep.years_of_experience != null
                  ? String(ep.years_of_experience)
                  : prev.years_of_experience,
              image_url: ep.image
                ? `${BASE_URL}/uploads/${ep.image}`
                : prev.image_url,
              existing_cv: ep.cv || prev.existing_cv,
            }));
            if (ep.skills && ep.skills.length > 0) {
              setSelectedSkills(ep.skills.map((s) => s.skill_name));
            }
            if (ep.language_spoken) {
              setSelectedLanguages(
                ep.language_spoken
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean),
              );
            }
          }
        } catch (err) {
          console.log("Expert profile fetch error:", err.message);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── Pick Image ───────────────────────────────────────────────────────────
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required to access gallery");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setForm((prev) => ({
        ...prev,
        image_file: result.assets[0].uri,
        image_url: result.assets[0].uri,
      }));
    }
  };

  // ── Pick CV ──────────────────────────────────────────────────────────────
  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) updateForm("cv_file", result.assets[0]);
  };

  // ── Save Profile ─────────────────────────────────────────────────────────
  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("fullName", form.full_name);
      formData.append("email", form.email);
      formData.append("mobile", form.mobile);
      formData.append("domain", form.domain);
      formData.append("qualification", form.qualification);
      formData.append("experience", form.experience);
      formData.append("dob", form.dob);
      formData.append("preferred_job_role", form.preferred_job_role);
      formData.append("current_status", form.current_status);
      formData.append("expertise", form.expertise);
      formData.append("years_of_experience", form.years_of_experience);
      formData.append("linkedin", form.linkedin);

      if (isExpert) {
        formData.append("bio", form.bio);
        formData.append("location", form.location);
        formData.append("certification", form.certification);
        formData.append(
          "language_spoken",
          selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "",
        );
        if (selectedSkills.length > 0)
          formData.append("skills", selectedSkills.join(", "));
      } else {
        formData.append("skills", form.skills);
      }

      if (form.image_file) {
        formData.append("image", {
          uri: form.image_file,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }
      if (form.cv_file) {
        const cleanUri = form.cv_file.uri.split("?")[0];
        const ext = cleanUri.split(".").pop();
        formData.append("cv", {
          uri: cleanUri,
          name: form.cv_file.name || `cv.${ext}`,
          type: ext === "pdf" ? "application/pdf" : `image/${ext}`,
        });
      }

      await axios.post(`${BASE_URL}/api/users/save-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (isExpert) {
        const expertFormData = new FormData();
        expertFormData.append("fullName", form.full_name);
        expertFormData.append("domain", form.domain);
        expertFormData.append("bio", form.bio);
        expertFormData.append("location", form.location);
        expertFormData.append("certification", form.certification);
        expertFormData.append("certifications", form.certification);
        expertFormData.append("expertise", form.expertise);
        expertFormData.append(
          "experience",
          form.years_of_experience || form.experience,
        );
        expertFormData.append(
          "language_spoken",
          selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "",
        );
        expertFormData.append(
          "skills",
          selectedSkills.length > 0 ? selectedSkills.join(", ") : "",
        );
        if (form.image_file) {
          expertFormData.append("image", {
            uri: form.image_file,
            name: "profile.jpg",
            type: "image/jpeg",
          });
        }
        await axios.put(`${BASE_URL}/api/experts/profile/me`, expertFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      Alert.alert("Success", "Profile Updated Successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.log("Save error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Profile update failed. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <StatusBar backgroundColor={TEAL} barStyle="light-content" />

      {/* ── TOP HEADER ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={{ backgroundColor: PAGE_BG }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── AVATAR SECTION ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.avatarWrap}
            activeOpacity={0.85}
          >
            <Image
              source={{
                uri: form.image_url || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        {/* ── BASIC INFO CARD ── */}
        <View style={styles.card}>
          <SectionHeader icon="person-outline" title="Basic Information" />

          <View style={styles.fieldGroup}>
            <FieldLabel text="Full Name" />
            <TextInput
              value={form.full_name}
              onChangeText={(text) => setForm({ ...form, full_name: text })}
              style={styles.input}
              placeholderTextColor={TEXT_2}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel text="Email" />
            <TextInput
              value={form.email}
              style={[styles.input, styles.inputDisabled]}
              editable={false}
              placeholderTextColor={TEXT_2}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel text="Mobile" />
            <TextInput
              value={form.mobile}
              onChangeText={(text) => setForm({ ...form, mobile: text })}
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor={TEXT_2}
              placeholder="Enter mobile number"
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel text="Domain" />
            <DropdownPicker
              label="Domain"
              value={form.domain}
              options={DOMAIN_OPTIONS}
              onChange={(v) => updateForm("domain", v)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel text="Qualification" />
            <DropdownPicker
              label="Qualification"
              value={form.qualification}
              options={QUALIFICATION_OPTIONS}
              onChange={(v) => updateForm("qualification", v)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel text="Experience" />
            <DropdownPicker
              label="Experience"
              value={form.experience}
              options={EXPERIENCE_OPTIONS}
              onChange={(v) => updateForm("experience", v)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel text="Date of Birth" />
            <TextInput
              value={form.dob}
              onChangeText={(text) => setForm({ ...form, dob: text })}
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={TEXT_2}
            />
          </View>

          {/* CV Upload */}
          <View style={styles.fieldGroup}>
            <FieldLabel text="CV / Resume" />
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={pickCV}
              activeOpacity={0.7}
            >
              <View style={styles.uploadIconWrap}>
                <Ionicons
                  name="document-attach-outline"
                  size={20}
                  color={TEAL}
                />
              </View>
              <Text style={styles.uploadText} numberOfLines={1}>
                {form.cv_file
                  ? form.cv_file.name
                  : form.existing_cv
                    ? `Current: ${form.existing_cv}`
                    : "Choose CV File (PDF/Image)"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={TEXT_2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── JOBSEEKER DETAILS ── */}
        {!isExpert && (
          <View style={styles.card}>
            <SectionHeader icon="briefcase-outline" title="Jobseeker Details" />

            <View style={styles.fieldGroup}>
              <FieldLabel text="Skills" />
              <TextInput
                value={form.skills}
                onChangeText={(text) => setForm({ ...form, skills: text })}
                style={styles.input}
                placeholderTextColor={TEXT_2}
                placeholder="e.g. React, Python"
              />
            </View>
            <View style={styles.fieldGroup}>
              <FieldLabel text="Preferred Job Role" />
              <TextInput
                value={form.preferred_job_role}
                onChangeText={(text) =>
                  setForm({ ...form, preferred_job_role: text })
                }
                style={styles.input}
                placeholderTextColor={TEXT_2}
                placeholder="e.g. Frontend Developer"
              />
            </View>
            <View style={styles.fieldGroup}>
              <FieldLabel text="Current Status" />
              <TextInput
                value={form.current_status}
                onChangeText={(text) =>
                  setForm({ ...form, current_status: text })
                }
                style={styles.input}
                placeholderTextColor={TEXT_2}
                placeholder="Student / Fresher / Working"
              />
            </View>
          </View>
        )}

        {/* ── EXPERT DETAILS ── */}
        {isExpert && (
          <View style={styles.card}>
            <SectionHeader icon="star-outline" title="Expert Details" />

            <View style={styles.fieldGroup}>
              <FieldLabel text="Skills (max 5)" />
              <SkillsPicker
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel text="Languages Known" />
              <LanguagesPicker
                selectedLanguages={selectedLanguages}
                onChange={setSelectedLanguages}
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel text="Location / City" />
              <DropdownPicker
                label="Location"
                value={form.location}
                options={LOCATION_OPTIONS}
                onChange={(v) => updateForm("location", v)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel text="Certification" />
              <TextInput
                value={form.certification}
                onChangeText={(text) =>
                  setForm({ ...form, certification: text })
                }
                style={styles.input}
                placeholderTextColor={TEXT_2}
                placeholder="e.g. AWS, PMP, MBA"
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel text="Bio" />
              <TextInput
                value={form.bio}
                onChangeText={(text) => updateForm("bio", text)}
                style={[styles.input, styles.textArea]}
                multiline
                placeholderTextColor={TEXT_2}
                placeholder="Write a short bio about yourself"
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel text="Expertise" />
              <TextInput
                value={form.expertise}
                onChangeText={(text) => setForm({ ...form, expertise: text })}
                style={styles.input}
                placeholderTextColor={TEXT_2}
                placeholder="Your area of expertise"
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel text="Years of Experience" />
              <TextInput
                value={form.years_of_experience}
                onChangeText={(text) =>
                  setForm({ ...form, years_of_experience: text })
                }
                style={styles.input}
                keyboardType="numeric"
                placeholderTextColor={TEXT_2}
                placeholder="e.g. 5"
              />
            </View>
          </View>
        )}

        {/* ── SAVE BUTTON ── */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveProfile}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PAGE_BG,
    gap: 12,
  },
  loadingText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Top header ──
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === "android" ? 44 : 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  headerBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.2,
  },

  // ── Scroll ──
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: TEAL,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoText: {
    color: TEAL,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },

  // ── Card ──
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: -0.1,
  },

  // ── Field ──
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_1,
    fontWeight: "500",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: TEXT_2,
  },
  textArea: {
    height: 100,
  },

  // ── Dropdown ──
  dropdownBox: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ── Upload box ──
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: "#b8d8d2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  uploadIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    flex: 1,
    fontSize: 14,
    color: TEAL,
    fontWeight: "600",
  },

  // ── Skills/Language chips ──
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
  },
  chipsEmpty: {
    color: TEXT_2,
    fontSize: 13,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  addChipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 12,
    borderStyle: "dashed",
    justifyContent: "center",
    backgroundColor: TEAL_LIGHT,
  },
  addChipText: {
    color: TEAL,
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Save button ──
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
    elevation: 3,
    shadowColor: TEAL,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    maxHeight: "55%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: TEXT_2,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "500",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  itemSelected: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 15,
    color: TEXT_1,
    fontWeight: "400",
  },
  itemTextSelected: {
    color: TEAL,
    fontWeight: "700",
  },
  customRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT_1,
  },
  customAddBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  customAddText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  doneBtn: {
    backgroundColor: TEAL,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  doneBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
