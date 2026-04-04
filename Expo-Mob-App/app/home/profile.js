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

import { BASE_URL } from "../../constants/config";
const SCREEN_HEIGHT = Dimensions.get("window").height;

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#ebddf8";
const TEAL_TEXT = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#eff0f2";
const WHITE = "#FFFFFF";

// ─── Modal content (unchanged) ────────────────────────────────────────────────
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

// ─── Info Modal ───────────────────────────────────────────────────────────────
function InfoModal({ visible, onClose, content }) {
  if (!content) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { height: SCREEN_HEIGHT * 0.75 }]}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{content.title}</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={20} color={TEXT_2} />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {content.sections.map((section, idx) => (
              <View key={idx} style={{ marginBottom: 18 }}>
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

// ─── Logout Confirm Modal ─────────────────────────────────────────────────────
function LogoutModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={lm.overlay}>
        <View style={lm.card}>
          {/* Title */}
          <Text style={lm.title}>Logout 🔐</Text>

          {/* Subtitle */}
          <Text style={lm.subtitle}>
            Are you sure you want to{"\n"}logout from your account?
          </Text>

          {/* Buttons */}
          <View style={lm.btnRow}>
            <TouchableOpacity
              style={lm.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={lm.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={lm.logoutBtn}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={16} color={WHITE} />
              <Text style={lm.logoutTxt}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingsRow({ icon, iconBg, label, onPress, danger }) {
  return (
    <TouchableOpacity
      style={settingsStyles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[settingsStyles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color="#fff" />
      </View>
      <Text style={[settingsStyles.label, danger && { color: "#ef4444" }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#c4c4cc" />
    </TouchableOpacity>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Ionicons name={icon} size={16} color={TEAL_TEXT} />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not available"}</Text>
    </View>
  </View>
);

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [expertProfile, setExpertProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aboutModal, setAboutModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [termsModal, setTermsModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not logged in");
        setLoading(false);
        return;
      }
      const userRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userRes.data.user;
      setProfile(user);

      if (user?.role === "expert") {
        try {
          const expertRes = await axios.get(
            `${BASE_URL}/api/experts/profile/me`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setExpertProfile(expertRes.data.data);
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

  const handleLogout = () => setLogoutModal(true);

  const confirmLogout = async () => {
    setLogoutModal(false);
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      router.replace("/loginOtp");
    } catch {
      Alert.alert("Error", "Logout failed. Try again.");
    }
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

  // ── FIX: Only use imageUrl if a real image was uploaded, otherwise null ──
  const rawImage = expertProfile?.image || profile?.image;
  const imageUrl =
    rawImage && rawImage.trim() !== ""
      ? rawImage.startsWith("http")
        ? rawImage
        : `${BASE_URL}/uploads/${rawImage}`
      : null;

  if (loading)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );

  const isExpert = profile?.role === "expert";
  const displayDomain = expertProfile?.domain || profile?.domain;
  const displayQualification = profile?.qualification;
  const displayExperience =
    expertProfile?.experience != null
      ? `${expertProfile.experience} ${expertProfile.experience == 1 ? "year" : "years"}`
      : profile?.experience
        ? `${profile.experience} years`
        : null;
  const displayName = expertProfile?.name || profile?.fullName || "No Name";

  const initials = displayName
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── TEAL COVER ── */}
        <View style={styles.cover}>
          <TouchableOpacity
            style={styles.coverBackBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.coverEditBtn}
            onPress={() => router.push("/home/edit")}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── AVATAR ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            {/* ── FIX: Show initials when no image uploaded ── */}
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.domain}>{displayDomain || "Domain not set"}</Text>
          {profile?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {displayExperience?.split(" ")[0] || "—"}
            </Text>
            <Text style={styles.statLabel}>Yrs Exp</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {expertProfile?.skills?.length || "—"}
            </Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>
              {expertProfile?.rating
                ? parseFloat(expertProfile.rating).toFixed(1)
                : "—"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* ── BASIC INFO CARD ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Personal Info</Text>
        </View>
        <View style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
          <InfoRow icon="call-outline" label="Mobile" value={profile?.mobile} />
          <InfoRow
            icon="calendar-outline"
            label="Birth Date"
            value={profile?.dob}
          />
          <InfoRow
            icon="school-outline"
            label="Qualification"
            value={displayQualification}
          />
          <InfoRow
            icon="briefcase-outline"
            label="Experience"
            value={displayExperience}
          />
        </View>

        {/* ── EXPERT DETAILS CARD ── */}
        {isExpert && (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>Expert Details</Text>
            </View>
            <View style={styles.card}>
              <InfoRow icon="tv-outline" label="Domain" value={displayDomain} />
              <InfoRow
                icon="location-outline"
                label="Location"
                value={expertProfile?.location}
              />
              <InfoRow
                icon="language-outline"
                label="Languages"
                value={expertProfile?.language_spoken}
              />
              <InfoRow
                icon="ribbon-outline"
                label="Certification"
                value={expertProfile?.certification}
              />
              {expertProfile?.bio ? (
                <View style={styles.bioRow}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={TEAL_TEXT}
                    />
                  </View>
                  <View style={{ marginLeft: 0, flex: 1 }}>
                    <Text style={styles.infoLabel}>Bio</Text>
                    <Text style={styles.infoValue}>{expertProfile.bio}</Text>
                  </View>
                </View>
              ) : null}
              {expertProfile?.skills && expertProfile.skills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={styles.infoLabel}>Skills</Text>
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
          </>
        )}

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cvBtn} onPress={openCV}>
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text style={styles.cvBtnText}>View CV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/home/edit")}
          >
            <Ionicons name="pencil-outline" size={18} color={TEAL} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── ACCOUNT SETTINGS ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Account Settings</Text>
        </View>
        <View style={styles.card}>
          <SettingsRow
            icon="information-circle-outline"
            iconBg={TEAL}
            label="About Us"
            onPress={() => setAboutModal(true)}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="lock-closed-outline"
            iconBg={TEAL}
            label="Privacy Policy"
            onPress={() => setPrivacyModal(true)}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="document-text-outline"
            iconBg={TEAL}
            label="Terms & Conditions"
            onPress={() => setTermsModal(true)}
          />
        </View>

        {/* ── LOGOUT BUTTON ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={19} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── INFO MODALS ── */}
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

      {/* ── LOGOUT CONFIRM MODAL ── */}
      <LogoutModal
        visible={logoutModal}
        onCancel={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PAGE_BG,
  },

  cover: { height: 130, backgroundColor: TEAL, position: "relative" },
  coverBackBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  coverEditBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    marginTop: 25,
    alignItems: "center",
  },

  avatarSection: { alignItems: "center", marginTop: -52, paddingBottom: 4 },
  avatarRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: CARD_BG,
    padding: 3,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },

  // ── NEW: fallback initials avatar ──
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_1,
    marginTop: 12,
    letterSpacing: -0.3,
  },
  domain: { fontSize: 14, color: TEXT_2, marginTop: 3, fontWeight: "500" },
  roleBadge: {
    marginTop: 8,
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { color: TEAL_TEXT, fontSize: 12, fontWeight: "700" },

  statsRow: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800", color: TEAL },
  statLabel: { fontSize: 12, color: TEXT_2, marginTop: 3, fontWeight: "500" },
  statDivider: { width: 1, backgroundColor: BORDER, marginVertical: 4 },

  sectionLabel: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_2,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: TEXT_2,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoValue: { fontSize: 15, fontWeight: "600", color: TEXT_1 },

  bioRow: {
    flexDirection: "row",
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    gap: 12,
  },

  skillsSection: { paddingVertical: 13 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  skillChip: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  skillChipText: { color: TEAL_TEXT, fontSize: 12, fontWeight: "700" },

  actionsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  cvBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: TEAL,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 2,
  },
  cvBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: CARD_BG,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  editBtnText: { color: TEAL, fontWeight: "700", fontSize: 14 },

  settingsDivider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginHorizontal: 4,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 14,
    elevation: 2,
  },
  logoutText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

// ── Settings row styles ────────────────────────────────────────────────────
const settingsStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 13,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  label: { flex: 1, fontSize: 15, fontWeight: "600", color: TEXT_1 },
});

// ── Info Modal styles ──────────────────────────────────────────────────────
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
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: "center",
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT_1,
    flex: 1,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PAGE_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_1,
    marginBottom: 5,
  },
  sectionBody: { fontSize: 14, color: TEXT_2, lineHeight: 22 },
});

// ── Logout Confirm Modal styles ────────────────────────────────────────────
const lm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 14,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_1,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_2,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: PAGE_BG,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelTxt: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_2,
  },
  logoutBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: WHITE,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PAGE_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_1,
    marginBottom: 5,
  },
  sectionBody: {
    fontSize: 14,
    color: TEXT_2,
    lineHeight: 22,
  },
});
