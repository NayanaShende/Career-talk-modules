import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getExpertById } from "../../services/expertService";

export default function ExpertProfile() {
  const { id } = useLocalSearchParams();

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpert();
  }, []);

  const fetchExpert = async () => {
    const res = await getExpertById(id);
    setExpert(res?.data || res);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!expert) return null;

  // safe conversions
  const languages =
    typeof expert.language_spoken === "string"
      ? expert.language_spoken.split(",")
      : expert.language_spoken || [];

  const skills =
    Array.isArray(expert.skills)
      ? expert.skills.map((s) => s.skill_name).join(", ")
      : "";

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= HEADER BANNER ================= */}
      <View style={styles.header}>

        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: "#fff", fontSize: 20 }}>←</Text>
        </Pressable>

        {/* Profile info */}
        <View style={styles.profileRow}>
          <Image
            source={{
              uri:
                expert.image ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.name}>{expert.name}</Text>
            <Text style={styles.role}>
              {expert.role || expert.headline}
            </Text>

            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        {/* Follow button */}
        <Pressable style={styles.followBtn}>
          <Text style={{ color: "#0E7490", fontWeight: "bold" }}>
            + Follow
          </Text>
        </Pressable>
      </View>

      {/* ================= BODY ================= */}
      <ScrollView style={{ flex: 1 }}>

        <InfoRow title="Experience" value={`${expert.experience || 0} Years`} />
        {expert.location && (
          <InfoRow title="Location" value={expert.location} />
        )}
        {languages.length > 0 && (
          <InfoRow title="Languages Spoken" value={languages.join(", ")} />
        )}
        {skills && <InfoRow title="Expertise" value={skills} />}
        {expert.bio && (
          <InfoRow title="Profile Summary" value={expert.bio} />
        )}
      </ScrollView>

      {/* ================= BOTTOM BUTTONS ================= */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.chatBtn}>
          <Text style={styles.btnText}>💬 CHAT</Text>
        </Pressable>

        <Pressable style={styles.callBtn}>
          <Text style={styles.btnText}>📞 CALL</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ================= COMPONENT ================= */
function InfoRow({ title, value }) {
  return (
    <View style={styles.rowCard}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */
  header: {
    backgroundColor: "#111827",
    padding: 20,
    paddingTop: 40,
  },

  backBtn: {
    marginBottom: 10,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FACC15",
    marginRight: 15,
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  role: {
    color: "#CBD5E1",
    marginTop: 4,
  },

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  onlineText: {
    color: "#CBD5E1",
  },

  followBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  /* LIST CARDS */
  rowCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  rowTitle: {
    fontWeight: "bold",
    color: "#374151",
  },

  rowValue: {
    marginTop: 4,
    color: "#6B7280",
  },

  /* BOTTOM */
  bottomBar: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },

  chatBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#0EA5E9",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  callBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
