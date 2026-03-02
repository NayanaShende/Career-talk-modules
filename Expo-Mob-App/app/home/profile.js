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

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://192.168.1.3:3000";

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PROFILE DATA:", res.data.user);
      setProfile(res.data.user);
    } catch (err) {
      console.log("PROFILE ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  // load first time
  useEffect(() => {
    fetchProfile();
  }, []);

  // reload when coming back from edit screen
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const openCV = () => {
    if (!profile?.cvFile) {
      Alert.alert("No CV uploaded");
      return;
    }

    const cvUrl = profile.cvFile.startsWith("http")
      ? profile.cvFile
      : `${BASE_URL}/uploads/${profile.cvFile}`;

    Linking.openURL(cvUrl);
  };

  const imageUrl =
    profile?.image && profile.image.startsWith("http")
      ? profile.image
      : profile?.image
        ? `${BASE_URL}/uploads/${profile.image}`
        : "https://i.pravatar.cc/150";

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 120 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover} />

        <View style={styles.avatarWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        </View>

        <View style={styles.center}>
          <Text style={styles.name}>{profile?.fullName || "No Name"}</Text>
          <Text style={styles.domain}>
            {profile?.domain || "Domain not set"}
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="mail" label="Email" value={profile?.email} />
          <InfoRow icon="call" label="Mobile" value={profile?.mobile} />
          <InfoRow icon="calendar" label="Birth Date" value={profile?.dob} />
          <InfoRow
            icon="school"
            label="Qualification"
            value={profile?.qualification}
          />
          <InfoRow
            icon="briefcase"
            label="Experience"
            value={profile?.experience}
          />
        </View>

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
  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },
  row: { flexDirection: "row", marginBottom: 18 },
  label: { color: "#9CA3AF", fontSize: 12 },
  value: { fontSize: 16, fontWeight: "600" },
  cvButton: {
    backgroundColor: "#6C63FF",
    marginHorizontal: 20,
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
    borderColor: "#6C63FF",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  editText: { color: "#6C63FF", fontWeight: "600", fontSize: 15 },
});
