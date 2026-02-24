
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../services/api";

const SKILLS = [
  "All",
  "React",
  "Python",
  "DevOps",
  "Angular",
  "Java Spring Boot",
  "UI/UX Design",
  "Data Analysis",
];

export default function Dashboard() {
  const [onlineExperts, setOnlineExperts] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(true);

  const [topExperts, setTopExperts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);

  const [activeSkill, setActiveSkill] = useState("All");
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  useEffect(() => {
    fetchOnlineExperts();
    fetchTopExperts();

    const interval = setInterval(fetchOnlineExperts, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFilteredExperts(activeSkill);
  }, [activeSkill]);

  const fetchExperts = async () => {
    try {
      const data = await getAllExperts();
      setExperts(data || []);
    } catch (err) {
      console.log("Dashboard fetch error:", err);
    }
  };

  const fetchOnlineExperts = async () => {
    try {
      setLoadingOnline(true);
      const res = await axiosInstance.get("/experts/online");
      setOnlineExperts(res?.data?.data || []);
    } catch {
      setOnlineExperts([]);
    } finally {
      setLoadingOnline(false);
    }
  };

  const fetchTopExperts = async () => {
    try {
      setLoadingTop(true);
      const res = await axiosInstance.get("/experts");
      const list = res?.data?.data || [];
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setTopExperts(list.slice(0, 10));
    } catch {
      setTopExperts([]);
    } finally {
      setLoadingTop(false);
    }
  };

  // ✅ Fetch experts filtered by skill from backend
  const fetchFilteredExperts = async (skill) => {
    try {
      setLoadingFiltered(true);
      const url = skill === "All" ? "/experts" : `/experts?skill=${skill}`;
      const res = await axiosInstance.get(url);
      const list = res?.data?.data || [];
      setFilteredExperts(list);
    } catch {
      setFilteredExperts([]);
    } finally {
      setLoadingFiltered(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
  

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>C</Text>
          </View>
          <Text style={styles.headerText}>Career-Talk</Text>
          <Pressable style={styles.walletBtn}>
            <Text style={styles.walletText}>Add Cash +</Text>
          </Pressable>
        </View>

        {/* SEARCH */}
        <Pressable
          style={styles.searchBox}
          onPress={() => router.push("/expert/search")}>
          <Ionicons name="search" size={18} color="#777" />
          <Text style={{ marginLeft: 8, color: "#888" }}>
            Search experts...
          </Text>
        </Pressable>


        {/* BANNER */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              What will my future be{"\n"}in the next 5 years?
            </Text>
            <Text>Ask Expert</Text>
          </View>
          <Image
            source={require("../../../assets/banner.png")}
            style={styles.bannerImage}
          />
        </View>

        {/* PROMO */}
        <View style={styles.new}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannertitle}>Got any questions?</Text>
            <Text style={styles.bannertitle}>Chat With Expert</Text>
            <Text style={styles.bannertitle}>@INR 5/min</Text>
          </View>
          <Image
            source={require("../../../assets/new.png")}
            style={styles.bannerImage}
          />
        </View>

        {/* SKILL FILTER SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Skill</Text>
        </View>

        {/* Skill Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 15, marginBottom: 12 }}>
          {SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill}
              onPress={() => setActiveSkill(skill)}
              style={[
                styles.skillPill,
                activeSkill === skill && styles.skillPillActive,
              ]}>
              <Text
                style={[
                  styles.skillPillText,
                  activeSkill === skill && styles.skillPillTextActive,
                ]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filtered Expert Cards */}
        {loadingFiltered ? (
          <ActivityIndicator style={{ marginTop: 10 }} color="#7C3AED" />
        ) : filteredExperts.length === 0 ? (
          <Text style={styles.noExpertText}>
            No experts found for "{activeSkill}"
          </Text>

        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: 15 }}>
            {filteredExperts.map((e) => (
              <Pressable
                key={e.id}
                style={styles.filteredCard}
                onPress={() => router.push(`/expert/${e.id}`)}>
                <Image
                  source={{
                    uri: e.image || `https://ui-avatars.com/api/?name=${e.name || "User"}&background=7C3AED&color=fff`,
                  }}
                  style={styles.filteredImage}
                />
                <View style={styles.filteredInfo}>
                  <Text style={styles.filteredName} numberOfLines={1}>
                    {e.name || ""}
                  </Text>
                  <Text style={styles.filteredHeadline} numberOfLines={1}>
                    {e.headline || ""}
                  </Text>
                  <View style={styles.filteredMeta}>
                    <Text style={styles.filteredSkillTag}>
                      {e.skill || activeSkill}
                    </Text>
                    <Text style={styles.filteredRating}>
                      ⭐ {e.rating || "N/A"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* TOP EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Experts</Text>
          <Text
            style={styles.viewAll}
            onPress={() => router.push("/expert/recommended")}>
            View All
          </Text>
        </View>

        {loadingTop ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {topExperts.map((e) => (
              <Pressable
                key={e.id}
                style={styles.topExpertCard}
                onPress={() => router.push(`/expert/${e.id}`)}>
                <Image
                  source={{
                    uri: e.image || `https://ui-avatars.com/api/?name=${e.name || "User"}`,
                  }}
                  style={styles.topExpertImage}
                />
                <Text style={styles.topExpertName}>{e.name || ""}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* LIVE EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Experts</Text>
        </View>

        {loadingOnline ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {onlineExperts.map((e) => (
              <LiveExpert
                key={e.id}
                name={e.name || ""}
                title={e.role || ""}
                image={e.image || `https://ui-avatars.com/api/?name=${e.name || "User"}`}
                onPress={() => router.push(`/expert/${e.id}`)}
              />
            ))}
          </ScrollView>
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

/* CATEGORY */
const Category = ({ title, icon }) => (
  <View style={styles.categoryItem}>
    <Text style={styles.categoryIcon}>{icon}</Text>
    <Text style={styles.categoryText}>{title}</Text>
  </View>
);

/* LIVE EXPERT CARD */
const LiveExpert = ({ name, title, image, onPress }) => (
  <Pressable style={styles.liveCard} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.liveImage} />
    <View style={styles.liveBadge}>
      <Text style={styles.liveText}>LIVE</Text>
    </View>
    <View style={styles.liveOverlay}>
      <Text style={styles.liveName}>{name}</Text>
      <Text style={styles.liveTitle}>{title}</Text>
    </View>
  </Pressable>
);

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F7" },

  header: { flexDirection: "row", alignItems: "center", padding: 15 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: { marginLeft: 10, fontSize: 18, fontWeight: "bold" },
  walletBtn: {
    marginLeft: "auto",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  walletText: { fontWeight: "600" },

  searchBox: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  categoryItem: { alignItems: "center" },
  categoryIcon: {
    fontSize: 28,
    backgroundColor: "#BDE8F5",
    padding: 16,
    borderRadius: 40,
  },
  categoryText: { marginTop: 6 },

  banner: {
    flexDirection: "row",
    backgroundColor: "#FFF7CC",
    margin: 15,
    padding: 15,
    borderRadius: 14,
  },
  new: {
    flexDirection: "row",
    backgroundColor: "#111",
    margin: 15,
    padding: 15,
    borderRadius: 14,
  },
  bannertitle: { color: "#fff", fontWeight: "bold" },

  bannerTitle: { fontWeight: "bold", fontSize: 16 },
  bannerImage: { width: 160, height: 120 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 20,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16 },
  viewAll: { color: "#7C3AED", fontWeight: "600" },

  topExpertCard: { alignItems: "center", marginLeft: 15 },
  topExpertImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#6A5AE0",
  },
  topExpertName: { marginTop: 6, fontSize: 12 },

  liveCard: {
    width: 130,
    height: 170,
    borderRadius: 18,
    marginLeft: 15,
    overflow: "hidden",
  },
  liveImage: { width: "100%", height: "100%" },

  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "red",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  liveOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  liveName: { color: "#fff", fontWeight: "bold" },
  liveTitle: { color: "#ddd", fontSize: 11 },

  skillPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  skillPillActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  skillPillText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  skillPillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  filteredCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginRight: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  filteredImage: { width: "100%", height: 100 },
  filteredInfo: { padding: 10 },
  filteredName: { fontWeight: "bold", fontSize: 13, color: "#111" },
  filteredHeadline: { fontSize: 11, color: "#666", marginTop: 2 },
  filteredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  filteredSkillTag: {
    fontSize: 10,
    backgroundColor: "#EDE9FF",
    color: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "600",
  },
  filteredRating: { fontSize: 11, color: "#444", fontWeight: "600" },
  noExpertText: {
    textAlign: "center",
    color: "#999",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  navItem: { alignItems: "center" },
});
