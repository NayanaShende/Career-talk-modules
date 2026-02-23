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
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpertById } from "../../services/expertService";

const { width } = Dimensions.get("window");

export default function ExpertProfile() {
  const { id } = useLocalSearchParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    fetchExpert();
  }, [id]);

  const fetchExpert = async () => {
    try {
      const res = await getExpertById(id);
      setExpert(res?.data || res);
    } catch (err) {
      console.log("Profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!expert) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#1E293B" }}>No expert found</Text>
      </View>
    );
  }

  const skills = Array.isArray(expert.skills)
    ? expert.skills.map((s) => s.skill_name)
    : [];

  // REAL DATABASE VALUES
  const ratingValue = parseFloat(expert.rating) || 0;
  const totalReviews = expert.total_reviews || 0;

  // Helper to render stars based on DB rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={18}
          color="#F59E0B"
        />,
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.header}>
          <View style={styles.navBar}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>Expert Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.profileCenter}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    expert.image ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                }}
                style={styles.avatar}
              />
              <View
                style={[
                  styles.onlineBadge,
                  { backgroundColor: expert.isOnline ? "#22C55E" : "#EF4444" },
                ]}
              />
            </View>

            <Text style={styles.name}>{expert.name}</Text>
            <Text style={styles.role}>{expert.role || expert.headline}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statText}>
                  {expert.experience} Years Experience
                </Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statText}>{totalReviews} Reviews</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable style={styles.followBtn}>
                <Text style={styles.followText}>+ Follow</Text>
              </Pressable>
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                style={styles.askBtn}
              >
                <Text style={styles.askText}>Ask Question</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.whiteContent}>
          <View style={styles.tabBar}>
            {["Overview", "Sessions", "Articles"].map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeUnderline} />}
              </Pressable>
            ))}
          </View>

          <View style={styles.fullWidthCard}>
            <Text style={styles.cardTitle}>About Me</Text>
            <Text style={styles.cardText}>{expert.bio}</Text>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Details</Text>
            <DetailItem
              icon="briefcase-outline"
              label="Experience"
              value={`${expert.experience} Years`}
            />
            <DetailItem
              icon="map-marker-outline"
              label="Location"
              value={expert.location}
            />
            <DetailItem
              icon="translate"
              label="Languages"
              value={expert.language_spoken}
            />
            <DetailItem
              icon="certificate-outline"
              label="Certification"
              value={expert.certification}
            />
          </View>

          {skills.length > 0 && (
            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>Skills</Text>
              <View style={styles.skillContainer}>
                {skills.map((skill, i) => (
                  <View key={i} style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* REAL DATABASE RATINGS SECTION */}
          <View style={styles.fullWidthCard}>
            <Text style={styles.cardTitle}>Ratings & Reviews</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingNum}>{ratingValue.toFixed(1)}</Text>
              <View style={styles.ratingInfo}>
                <View style={styles.starRow}>{renderStars(ratingValue)}</View>
                <Text style={styles.reviewSub}>({totalReviews} reviews)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <Pressable style={[styles.actionBtn, styles.chatBtn]}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#1E293B"
            />
            <Text style={styles.chatBtnText}>Chat</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.callBtn]}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.callBtnText}>Call</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={18} color="#6366F1" />
    </View>
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Not specified"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 35 },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  profileCenter: { alignItems: "center", marginTop: 5 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#6366F1",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 10 },
  role: { color: "#94A3B8", fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: { color: "#E2E8F0", fontSize: 11 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 15,
  },
  followBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  followText: { color: "#fff", fontWeight: "500" },
  askBtn: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 5,
  },
  askText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  whiteContent: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -25,
    padding: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabItem: { paddingBottom: 10, alignItems: "center", flex: 1 },
  tabText: { color: "#94A3B8", fontWeight: "600" },
  activeTabText: { color: "#1E293B" },
  activeUnderline: {
    position: "absolute",
    bottom: -1,
    width: 40,
    height: 3,
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  fullWidthCard: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
  },
  cardText: { fontSize: 14, color: "#64748B", lineHeight: 20 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 15 },
  ratingNum: { fontSize: 36, fontWeight: "bold", color: "#1E293B" },
  ratingInfo: { justifyContent: "center" },
  starRow: { flexDirection: "row", marginBottom: 4 },
  reviewSub: { fontSize: 13, color: "#94A3B8" },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: { fontSize: 12, color: "#94A3B8" },
  detailValue: { fontSize: 14, color: "#1E293B", fontWeight: "600" },
  skillContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  skillBadgeText: { color: "#475569", fontSize: 13, fontWeight: "500" },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomBar: {
    height: 65,
    backgroundColor: "#fff",
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  actionBtn: {
    flex: 1,
    height: "100%",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chatBtn: { backgroundColor: "#fff", marginRight: 5 },
  callBtn: { backgroundColor: "#1E293B", marginLeft: 5 },
  chatBtnText: { fontWeight: "bold", color: "#1E293B", fontSize: 15 },
  callBtnText: { fontWeight: "bold", color: "#fff", fontSize: 15 },
});
