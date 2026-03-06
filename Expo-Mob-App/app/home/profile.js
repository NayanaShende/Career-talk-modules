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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Single consistent BASE_URL
const BASE_URL = "http://10.89.141.25:3000";

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [expertProfile, setExpertProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
          const expertRes = await axios.get(`${BASE_URL}/api/experts/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const ep = expertRes.data.data;
          console.log("✅ EXPERT:", JSON.stringify(ep));
          setExpertProfile(ep);
        } catch (expertErr) {
          console.log("Expert fetch error:", expertErr.response?.data || expertErr.message);
        }
      }
    } catch (err) {
      console.log("PROFILE ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  useFocusEffect(
    useCallback(() => { fetchProfile(); }, [])
  );

  const openCV = () => {
    const cvFile = expertProfile?.cv || profile?.cvFile;
    if (!cvFile) { Alert.alert("No CV uploaded"); return; }
    const cvUrl = cvFile.startsWith("http") ? cvFile : `${BASE_URL}/uploads/${cvFile}`;
    Linking.openURL(cvUrl);
  };

  // ✅ FIXED: check expertProfile image first, then user image
  const rawImage = expertProfile?.image || profile?.image;
  const imageUrl = rawImage
    ? rawImage.startsWith("http") ? rawImage : `${BASE_URL}/uploads/${rawImage}`
    : "https://i.pravatar.cc/150";

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 120 }} />;

  const isExpert = profile?.role === "expert";

  // ✅ FIXED: pull domain, qualification from correct source
  const displayDomain = expertProfile?.domain || profile?.domain;
  const displayQualification = profile?.qualification;
  const displayExperience = expertProfile?.experience != null
    ? `${expertProfile.experience} ${expertProfile.experience == 1 ? "year" : "years"}`
    : profile?.experience ? `${profile.experience} years` : null;

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
          {/* ✅ FIXED: show domain under name */}
          <Text style={styles.domain}>
            {displayDomain || "Domain not set"}
          </Text>
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
          {/* ✅ FIXED: qualification from user profile */}
          <InfoRow icon="school" label="Qualification" value={displayQualification} />
          <InfoRow icon="briefcase" label="Experience" value={displayExperience} />
        </View>

        {/* Expert Details Card */}
        {isExpert && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expert Details</Text>
            {/* ✅ FIXED: domain shown here too */}
            <InfoRow icon="tv-outline" label="Domain" value={displayDomain} />
            <InfoRow icon="location" label="Location" value={expertProfile?.location} />
            <InfoRow icon="language" label="Languages" value={expertProfile?.language_spoken} />
            <InfoRow icon="ribbon" label="Certification" value={expertProfile?.certification} />
            {expertProfile?.bio ? (
              <View style={styles.bioRow}>
                <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
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
          onPress={() => router.push("/home/edit")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
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
  cover: { height: 110, backgroundColor: "#6C63FF" },
  avatarWrapper: { alignItems: "center", marginTop: -55 },
  avatar: { width: 110, height: 110, borderRadius: 60, borderWidth: 4, borderColor: "#fff" },
  center: { alignItems: "center", marginTop: 10 },
  name: { fontSize: 22, fontWeight: "bold" },
  domain: { color: "#6B7280", marginTop: 4 },
  roleBadge: {
    marginTop: 6, backgroundColor: "#6C63FF",
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20,
  },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#fff", margin: 20, marginBottom: 0,
    borderRadius: 18, padding: 20, elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0B2D72", marginBottom: 14 },
  row: { flexDirection: "row", marginBottom: 18 },
  bioRow: { flexDirection: "row", marginBottom: 18, alignItems: "flex-start" },
  label: { color: "#9CA3AF", fontSize: 12 },
  value: { fontSize: 16, fontWeight: "600" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    backgroundColor: "#EEF2FF", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  skillChipText: { color: "#6C63FF", fontSize: 13, fontWeight: "600" },
  cvButton: {
    backgroundColor: "#6C63FF", margin: 20, marginBottom: 0,
    padding: 15, borderRadius: 14,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  cvText: { color: "#fff", marginLeft: 8, fontWeight: "600", fontSize: 15 },
  editButton: {
    margin: 20, borderWidth: 1, borderColor: "#6C63FF",
    padding: 15, borderRadius: 14, alignItems: "center",
  },
  editText: { color: "#6C63FF", fontWeight: "600", fontSize: 15 },
});