import React, { useEffect, useState } from "react";
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
import { router } from "expo-router";

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const userEmail = "xyz@gmail.com"; // from login session

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://192.168.1.22:3000/api/profile/${userEmail}`,
      );
      setProfile(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const openCV = () => {
    if (profile?.cv_file) {
      Linking.openURL(profile.cv_file);
    } else {
      Alert.alert("No CV uploaded");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 120 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* COVER AREA */}
        <View style={styles.cover} />

        {/* PROFILE IMAGE */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: profile?.profile_image || "https://i.pravatar.cc/150",
            }}
            style={styles.avatar}
          />
        </View>

        {/* NAME & DOMAIN */}
        <View style={styles.center}>
          <Text style={styles.name}>{profile?.full_name || "No Name"}</Text>
          <Text style={styles.domain}>
            {profile?.domain || "Domain not set"}
          </Text>
        </View>

        {/* DETAILS CARD */}
        <View style={styles.card}>
          <InfoRow icon="mail" label="Email" value={profile?.email} />
          <InfoRow icon="call" label="Mobile" value={profile?.mobile} />
          <InfoRow
            icon="calendar"
            label="Birth Date"
            value={profile?.birthdate}
          />
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

        {/* CV BUTTON */}
        <TouchableOpacity style={styles.cvButton} onPress={openCV}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.cvText}>View / Download CV</Text>
        </TouchableOpacity>

        {/* EDIT BUTTON */}
        {/* EDIT BUTTON */}
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

  cover: {
    height: 110,
    backgroundColor: "#6C63FF",
  },

  avatarWrapper: {
    alignItems: "center",
    marginTop: -55,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },

  center: {
    alignItems: "center",
    marginTop: 10,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  domain: {
    color: "#6B7280",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    marginBottom: 18,
  },

  label: {
    color: "#9CA3AF",
    fontSize: 12,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },

  cvButton: {
    backgroundColor: "#6C63FF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  cvText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },

  editButton: {
    margin: 20,
    borderWidth: 1,
    borderColor: "#6C63FF",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  editText: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 15,
  },
});
