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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
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
      >
        <Text style={{ color: selected ? "#000" : "#777", fontSize: 15 }}>
          {selected ? selected.label : `Select ${label}`}
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
      <View style={styles.selectedChipsContainer}>
        {selectedSkills.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No skills selected
          </Text>
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
                size={14}
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
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addChipBtnText}>
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
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom skill..."
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={styles.customAddBtn}
              onPress={addCustomSkill}
            >
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
                        color: isSelected ? "#0B2D72" : "#333",
                        fontWeight: isSelected ? "700" : "400",
                      }}
                    >
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
            style={[styles.saveBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.saveText}>Done</Text>
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
      <View style={styles.selectedChipsContainer}>
        {selectedLanguages.length === 0 ? (
          <Text style={{ color: "#777", fontSize: 13 }}>
            No languages selected
          </Text>
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
                size={14}
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
        <Ionicons name="add-circle-outline" size={18} color="#0B2D72" />
        <Text style={styles.addChipBtnText}>
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
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom language..."
              value={customLang}
              onChangeText={setCustomLang}
            />
            <TouchableOpacity
              style={styles.customAddBtn}
              onPress={addCustomLanguage}
            >
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
                  onPress={() => toggleLanguage(item)}
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
                        color: isSelected ? "#0B2D72" : "#333",
                        fontWeight: isSelected ? "700" : "400",
                      }}
                    >
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
            style={[styles.saveBtn, { marginTop: 10 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

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
    // Jobseeker fields
    skills: "",
    preferred_job_role: "",
    current_status: "",
    // Expert fields
    expertise: "",
    years_of_experience: "",
    linkedin: "",
    bio: "",
    location: "",
    certification: "",
    // Files
    image_file: null,
    image_url: "",
    cv_file: null,
    existing_cv: "",
  });

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Fetch Profile ───────────────────────────────────────────────────────────
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

      // ── If expert, also load expert profile ──────────────────────────────
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
              image_url: ep.image
                ? `${BASE_URL}/uploads/${ep.image}`
                : prev.image_url,
              existing_cv: ep.cv || prev.existing_cv,
            }));

            // Pre-fill skills chips
            if (ep.skills && ep.skills.length > 0) {
              setSelectedSkills(ep.skills.map((s) => s.skill_name));
            }

            // Pre-fill language chips
            if (ep.language_spoken) {
              const langs = ep.language_spoken
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean);
              setSelectedLanguages(langs);
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

  // ── Pick Image ──────────────────────────────────────────────────────────────
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

  // ── Pick CV ─────────────────────────────────────────────────────────────────
  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) updateForm("cv_file", result.assets[0]);
  };

  // ── Save Profile ────────────────────────────────────────────────────────────
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
      formData.append("skills", form.skills);
      formData.append("preferred_job_role", form.preferred_job_role);
      formData.append("current_status", form.current_status);
      formData.append("expertise", form.expertise);
      formData.append("years_of_experience", form.years_of_experience);
      formData.append("linkedin", form.linkedin);

      if (isExpert) {
        formData.append("bio", form.bio);
        formData.append("location", form.location);
        formData.append("certification", form.certification);
        if (selectedSkills.length > 0) {
          formData.append("skills", selectedSkills.join(", "));
        }
        if (selectedLanguages.length > 0) {
          formData.append("language_spoken", selectedLanguages.join(", "));
        }
      }

      // New image only if user picked one
      if (form.image_file) {
        formData.append("image", {
          uri: form.image_file,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }

      // New CV only if user picked one
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

      Alert.alert("✅ Success", "Profile Updated Successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0B2D72" />
        <Text style={{ marginTop: 10, color: "#0B2D72" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* ── Profile Image ── */}
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image
            source={{
              uri: form.image_url || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </TouchableOpacity>

        {/* ── Basic Info ── */}
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <InputField
          label="Full Name"
          value={form.full_name}
          field="full_name"
          setForm={setForm}
          form={form}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { color: "#999" }]}
          value={form.email}
          editable={false}
        />

        <InputField
          label="Mobile"
          value={form.mobile}
          field="mobile"
          setForm={setForm}
          form={form}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Domain</Text>
        <DropdownPicker
          label="Domain"
          value={form.domain}
          options={DOMAIN_OPTIONS}
          onChange={(v) => updateForm("domain", v)}
        />

        <Text style={styles.label}>Qualification</Text>
        <DropdownPicker
          label="Qualification"
          value={form.qualification}
          options={QUALIFICATION_OPTIONS}
          onChange={(v) => updateForm("qualification", v)}
        />

        <Text style={styles.label}>Experience</Text>
        <DropdownPicker
          label="Experience"
          value={form.experience}
          options={EXPERIENCE_OPTIONS}
          onChange={(v) => updateForm("experience", v)}
        />

        <InputField
          label="Date of Birth (YYYY-MM-DD)"
          value={form.dob}
          field="dob"
          setForm={setForm}
          form={form}
          placeholder="e.g. 1995-06-15"
        />

        {/* ── CV Upload ── */}
        <Text style={styles.label}>CV / Resume</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickCV}>
          <Ionicons name="document-attach-outline" size={20} color="#0B2D72" />
          <Text style={styles.uploadBtnText}>
            {form.cv_file
              ? form.cv_file.name
              : form.existing_cv
                ? `Current: ${form.existing_cv}`
                : "Choose CV File"}
          </Text>
        </TouchableOpacity>

        {/* ── Jobseeker Details ── */}
        {!isExpert && (
          <>
            <Text style={styles.sectionTitle}>Jobseeker Details</Text>
            <InputField
              label="Skills"
              value={form.skills}
              field="skills"
              setForm={setForm}
              form={form}
            />
            <InputField
              label="Preferred Job Role"
              value={form.preferred_job_role}
              field="preferred_job_role"
              setForm={setForm}
              form={form}
            />
            <InputField
              label="Current Status (Student / Fresher)"
              value={form.current_status}
              field="current_status"
              setForm={setForm}
              form={form}
            />
          </>
        )}

        {/* ── Expert Details ── */}
        {isExpert && (
          <>
            <Text style={styles.sectionTitle}>Expert Details</Text>

            <Text style={styles.label}>Skills (max 5)</Text>
            <SkillsPicker
              selectedSkills={selectedSkills}
              onChange={setSelectedSkills}
            />

            <Text style={styles.label}>Languages Known</Text>
            <LanguagesPicker
              selectedLanguages={selectedLanguages}
              onChange={setSelectedLanguages}
            />

            <Text style={styles.label}>Location / City</Text>
            <DropdownPicker
              label="Location"
              value={form.location}
              options={LOCATION_OPTIONS}
              onChange={(v) => updateForm("location", v)}
            />

            <InputField
              label="Certification"
              value={form.certification}
              field="certification"
              setForm={setForm}
              form={form}
              placeholder="e.g. AWS, PMP, MBA"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={form.bio}
              onChangeText={(text) => updateForm("bio", text)}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
              placeholder="Write a short bio about yourself"
            />

            <InputField
              label="Expertise"
              value={form.expertise}
              field="expertise"
              setForm={setForm}
              form={form}
            />
            <InputField
              label="Years of Experience"
              value={form.years_of_experience}
              field="years_of_experience"
              setForm={setForm}
              form={form}
              keyboardType="numeric"
            />
            <InputField
              label="LinkedIn Profile"
              value={form.linkedin}
              field="linkedin"
              setForm={setForm}
              form={form}
              placeholder="https://linkedin.com/in/..."
            />
          </>
        )}

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Reusable Input Field ─────────────────────────────────────────────────────
function InputField({
  label,
  value,
  field,
  setForm,
  form,
  keyboardType,
  placeholder,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => setForm({ ...form, [field]: text })}
        style={styles.input}
        keyboardType={keyboardType || "default"}
        placeholder={placeholder || ""}
      />
    </View>
  );
}

export default EditProfile;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },

  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  cameraIcon: {
    position: "absolute",
    bottom: 28,
    right: "33%",
    backgroundColor: "#0B2D72",
    borderRadius: 14,
    padding: 5,
  },
  changePhoto: { color: "#0B2D72", marginTop: 8, fontWeight: "600" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 10,
    color: "#0B2D72",
  },

  inputGroup: { marginBottom: 15 },
  label: {
    marginBottom: 5,
    fontWeight: "500",
    color: "#374151",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
    marginTop: 5,
  },

  uploadBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fafafa",
    marginTop: 5,
  },
  uploadBtnText: { color: "#374151", fontWeight: "500", flex: 1 },

  selectedChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    minHeight: 40,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  addChipBtn: {
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
  addChipBtnText: { color: "#0B2D72", fontWeight: "600" },

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

  customRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  customInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  customAddBtn: {
    backgroundColor: "#0B2D72",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },

  saveBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
