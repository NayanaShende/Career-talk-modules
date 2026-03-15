import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Single consistent BASE_URL
const BASE_URL = "http://192.168.1.6:3000";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// ─── Modal Content ────────────────────────────────────────────────────────────

const ABOUT_US_CONTENT = {
  title: "About Career-Talk",
  sections: [
    {
      heading: null,
      body: "Career-Talk is a professional platform based in India, dedicated to connecting individuals with verified domain experts for personalized career guidance and mentorship.",
    },
    {
      heading: "Our Mission",
      body: "Our mission is to empower individuals by providing access to experienced professionals who can guide them through career decisions, skill development, and professional growth.",
    },
    {
      heading: "What We Offer",
      body: "We provide live expert sessions, chat consultations, domain-based expert browsing, and a wallet system for seamless payments — all in one easy-to-use mobile app.",
    },
    {
      heading: "Our Core Team",
      body: "A dedicated team of engineers, designers, and business professionals working together to deliver a world-class career mentorship experience.",
    },
    {
      heading: null,
      body: "At Career-Talk, we believe in building long-term relationships through trust, commitment, and delivering real career value to every user.",
    },
  ],
};

const PRIVACY_POLICY_CONTENT = {
  title: "Privacy Policy",
  sections: [
    {
      heading: null,
      body: "We value your privacy. This Privacy Policy explains how Career-Talk collects, uses, and protects your information when you use our app.",
    },
    {
      heading: "Information We Collect",
      body: "We may collect personal information such as your name, mobile number, email address, profile photo, CV, and other details necessary to provide our services.",
    },
    {
      heading: "How We Use Your Information",
      body: "Your information is used to create and manage your account, connect you with experts, process payments, and improve our services. We do not sell your data to third parties.",
    },
    {
      heading: "Data Security",
      body: "We implement industry-standard security measures to protect your personal data from unauthorized access, disclosure, or misuse.",
    },
    {
      heading: "Your Rights",
      body: "You have the right to access, update, or delete your personal information at any time by contacting us or using the profile settings within the app.",
    },
    {
      heading: "Contact Us",
      body: "If you have any questions about this Privacy Policy, please contact us at support@careertalk.in.",
    },
  ],
};

const TERMS_CONTENT = {
  title: "Terms & Conditions",
  sections: [
    {
      heading: null,
      body: "These Terms and Conditions govern your use of the Career-Talk mobile application. By using the app you agree to be bound by these terms.",
    },
    {
      heading: "1. Use of Service",
      body: "You may use the service only in compliance with applicable laws and the terms contained herein. You must be at least 18 years old to use Career-Talk.",
    },
    {
      heading: "2. Account",
      body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
    },
    {
      heading: "3. Payments",
      body: "All payments made through Career-Talk are final unless a dispute is raised within 24 hours of the session. Wallet credits are non-refundable once used.",
    },
    {
      heading: "4. Expert Conduct",
      body: "Experts are independent professionals. Career-Talk facilitates the connection but is not liable for the advice given during sessions.",
    },
    {
      heading: "5. Termination",
      body: "Career-Talk reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or inappropriate behavior.",
    },
  ],
};

// ─── Info Modal Component ─────────────────────────────────────────────────────
// ✅ FIXED: use pixel height instead of % so it works reliably on Expo mobile
function InfoModal({ visible, onClose, content }) {
  if (!content) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { height: SCREEN_HEIGHT * 0.75 }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{content.title}</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          {/* ✅ FIXED: ScrollView fills remaining space using flex: 1 inside fixed-height container */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}>
            {content.sections.map((section, idx) => (
              <View key={idx} style={{ marginBottom: 16 }}>
                {section.heading && (
                  <Text style={modalStyles.sectionHeading}>
                    {section.heading}
                  </Text>
                )}
                <Text style={modalStyles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Settings Row Component ───────────────────────────────────────────────────
function SettingsRow({ icon, iconBg, label, onPress }) {
  return (
    <TouchableOpacity style={settingsStyles.row} onPress={onPress}>
      <View style={[settingsStyles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={settingsStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [expertProfile, setExpertProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Modal states
  const [aboutModal, setAboutModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [termsModal, setTermsModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not logged in");
        setLoading(false);
        return;
      }

      // STEP 1: Fetch user profile
      const userRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userRes.data.user;
      console.log("✅ USER:", JSON.stringify(user));
      setProfile(user);

      // STEP 2: If expert, fetch expert profile
      if (user?.role === "expert") {
        try {
          const expertRes = await axios.get(
            `${BASE_URL}/api/experts/profile/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const ep = expertRes.data.data;
          console.log("✅ EXPERT:", JSON.stringify(ep));
          setExpertProfile(ep);
        } catch (expertErr) {
          console.log(
            "Expert fetch error:",
            expertErr.response?.data || expertErr.message,
          );
        }
      }
    } catch (err) {
      console.log("PROFILE ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  // ✅ Logout function
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            // ✅ FIXED: correct path for loginOtp screen
            router.replace("/loginOtp");
          } catch (e) {
            Alert.alert("Error", "Logout failed. Try again.");
          }
        },
      },
    ]);
  };

  const openCV = () => {
    const cvFile = expertProfile?.cv || profile?.cvFile;
    if (!cvFile) {
      Alert.alert("No CV uploaded");
      return;
    }
    const cvUrl = cvFile.startsWith("http")
      ? cvFile
      : `${BASE_URL}/uploads/${cvFile}`;
    Linking.openURL(cvUrl);
  };

  // ✅ FIXED: check expertProfile image first, then user image
  const rawImage = expertProfile?.image || profile?.image;
  const imageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${BASE_URL}/uploads/${rawImage}`
    : "https://i.pravatar.cc/150";

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 120 }} />;

  const isExpert = profile?.role === "expert";

  // ✅ FIXED: pull domain, qualification from correct source
  const displayDomain = expertProfile?.domain || profile?.domain;
  const displayQualification = profile?.qualification;
  const displayExperience =
    expertProfile?.experience != null
      ? `${expertProfile.experience} ${expertProfile.experience == 1 ? "year" : "years"}`
      : profile?.experience
        ? `${profile.experience} years`
        : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover} />

        <View style={styles.avatarWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        </View>

        <View style={styles.center}>
          <Text style={styles.name}>
            {expertProfile?.name || profile?.fullName || "No Name"}
          </Text>
          <Text style={styles.domain}>{displayDomain || "Domain not set"}</Text>
          {profile?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Basic Info Card */}
        <View style={styles.card}>
          <InfoRow icon="mail" label="Email" value={profile?.email} />
          <InfoRow icon="call" label="Mobile" value={profile?.mobile} />
          <InfoRow icon="calendar" label="Birth Date" value={profile?.dob} />
          <InfoRow
            icon="school"
            label="Qualification"
            value={displayQualification}
          />
          <InfoRow
            icon="briefcase"
            label="Experience"
            value={displayExperience}
          />
        </View>

        {/* Expert Details Card */}
        {isExpert && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expert Details</Text>
            <InfoRow icon="tv-outline" label="Domain" value={displayDomain} />
            <InfoRow
              icon="location"
              label="Location"
              value={expertProfile?.location}
            />
            <InfoRow
              icon="language"
              label="Languages"
              value={expertProfile?.language_spoken}
            />
            <InfoRow
              icon="ribbon"
              label="Certification"
              value={expertProfile?.certification}
            />
            {expertProfile?.bio ? (
              <View style={styles.bioRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color="#6B7280"
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.label}>Bio</Text>
                  <Text style={styles.value}>{expertProfile.bio}</Text>
                </View>
              </View>
            ) : null}

            {/* ✅ Skills chips */}
            {expertProfile?.skills && expertProfile.skills.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>Skills</Text>
                <View style={styles.skillsRow}>
                  {expertProfile.skills.map((s, i) => (
                    <View key={i} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{s.skill_name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.cvButton} onPress={openCV}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.cvText}>View / Download CV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/home/edit")}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* ✅ NEW: Settings Section — About Us, Privacy Policy, Terms */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Account Settings</Text>
          <SettingsRow
            icon="information-circle-outline"
            iconBg="#0B2D72"
            label="About Us"
            onPress={() => setAboutModal(true)}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="lock-closed-outline"
            iconBg="#0B2D72"
            label="Privacy Policy"
            onPress={() => setPrivacyModal(true)}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            iconBg="#0B2D72"
            label="Terms & Conditions"
            onPress={() => setTermsModal(true)}
          />
        </View>

        {/* ✅ Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ NEW: Modals */}
      <InfoModal
        visible={aboutModal}
        onClose={() => setAboutModal(false)}
        content={ABOUT_US_CONTENT}
      />
      <InfoModal
        visible={privacyModal}
        onClose={() => setPrivacyModal(false)}
        content={PRIVACY_POLICY_CONTENT}
      />
      <InfoModal
        visible={termsModal}
        onClose={() => setTermsModal(false)}
        content={TERMS_CONTENT}
      />
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#6B7280" />
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not available"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  cover: { height: 110, backgroundColor: "#0B2D72" },
  avatarWrapper: { alignItems: "center", marginTop: -55 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  center: { alignItems: "center", marginTop: 10 },
  name: { fontSize: 22, fontWeight: "bold" },
  domain: { color: "#6B7280", marginTop: 4 },
  roleBadge: {
    marginTop: 6,
    backgroundColor: "#0B2D72",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    marginBottom: 0,
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 14,
  },
  row: { flexDirection: "row", marginBottom: 18 },
  bioRow: { flexDirection: "row", marginBottom: 18, alignItems: "flex-start" },
  label: { color: "#9CA3AF", fontSize: 12 },
  value: { fontSize: 16, fontWeight: "600" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillChipText: { color: "#0B2D72", fontSize: 13, fontWeight: "600" },
  cvButton: {
    backgroundColor: "#0B2D72",
    margin: 20,
    marginBottom: 0,
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cvText: { color: "#fff", marginLeft: 8, fontWeight: "600", fontSize: 15 },
  editButton: {
    margin: 20,
    borderWidth: 1,
    borderColor: "#0B2D72",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 0,
  },
  editText: { color: "#0B2D72", fontWeight: "600", fontSize: 15 },

  // ✅ NEW: Settings card styles
  settingsCard: {
    backgroundColor: "#fff",
    margin: 20,
    marginBottom: 0,
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 12,
  },

  logoutButton: {
    margin: 20,
    marginTop: 12,
    backgroundColor: "#a51111",
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
});

// ✅ NEW: Settings row styles
const settingsStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
});

// ✅ FIXED: Modal styles — overlay stops above tab bar so tabs remain visible
const TAB_BAR_HEIGHT = 80;
const modalStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    // height is set inline via SCREEN_HEIGHT * 0.75
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
});