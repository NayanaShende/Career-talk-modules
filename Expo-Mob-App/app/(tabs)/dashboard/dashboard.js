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

  const getInitials = (name) => {
    if (!name) return "EX";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

  const fetchFilteredExperts = async (skill) => {
    try {
      setLoadingFiltered(true);
      const url = skill === "All" ? "/experts" : `/experts?skill=${skill}`;
      const res = await axiosInstance.get(url);
      setFilteredExperts(res?.data?.data || []);
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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>C</Text>
          </View>
          <Text style={styles.headerTitle}>Career-Talk</Text>
          <TouchableOpacity style={styles.addCashBtn}>
            <Text style={styles.addCashText}>Add Cash +</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push("/expert/search")}
        >
          <Ionicons name="search" size={20} color="#C4C4C4" />
          <Text style={styles.searchText}>Search</Text>
        </Pressable>

        {/* BANNER */}
        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>
              What will my future be{"\n"}in the next 5 years?
            </Text>
            <Text style={styles.promoSub}>Ask Expert</Text>
            <TouchableOpacity style={styles.askExpertBtn}>
              <Text style={styles.askExpertBtnText}>Ask Expert</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require("../../../assets/banner.png")}
            style={styles.promoImage}
          />
        </View>

        {/* TOP EXPERT BY SKILL SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Exper by Skill</Text>
          <TouchableOpacity onPress={() => router.push("/expert/recommended")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* ADDED: SKILL FILTER PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.skillFilterContainer}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill}
              onPress={() => setActiveSkill(skill)}
              style={[
                styles.skillPill,
                activeSkill === skill && styles.skillPillActive,
              ]}
            >
              <Text
                style={[
                  styles.skillPillText,
                  activeSkill === skill && styles.skillPillTextActive,
                ]}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loadingFiltered ? (
          <ActivityIndicator color="#0B2D72" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertBySkillList}
          >
            {filteredExperts.length === 0 ? (
              <Text style={styles.noDataText}>No experts found for {activeSkill}</Text>
            ) : (
              filteredExperts.map((e) => (
                <Pressable
                  key={e.id}
                  style={styles.skillExpertCard}
                  onPress={() => router.push(`/expert/${e.id}`)}
                >
                  <View style={styles.expertInitialCircle}>
                    <Text style={styles.expertInitialText}>
                      {getInitials(e.name)}
                    </Text>
                  </View>
                  <Text style={styles.expertCardName} numberOfLines={1}>
                    {e.name}
                  </Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={14} color="#FBBF24" />
                    ))}
                  </View>
                  <View style={styles.expertSkillBadge}>
                    <Text style={styles.expertSkillText}>
                      {e.skill || activeSkill}
                    </Text>
                  </View>
                  <View style={styles.expertCardFooter} />
                </Pressable>
              ))
            )}
          </ScrollView>
        )}

        {/* TOP EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Experts</Text>
        </View>

        {loadingTop ? (
          <ActivityIndicator color="#0B2D72" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topExpertsList}
          >
            {topExperts.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.circularExpertContainer}
                onPress={() => router.push(`/expert/${e.id}`)}
              >
                <View style={styles.goldBorder}>
                  <View style={styles.innerCircle}>
                    <Text style={styles.circleInitial}>
                      {getInitials(e.name)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* LIVE EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Experts</Text>
        </View>

        {loadingOnline ? (
          <ActivityIndicator color="#0B2D72" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveScrollContainer}
          >
            {onlineExperts.map((e) => (
              <LiveExpert
                key={e.id}
                name={e.name || ""}
                title={e.role || ""}
                image={
                  e.image ||
                  `https://ui-avatars.com/api/?name=${e.name || "User"}`
                }
                onPress={() => router.push(`/expert/${e.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    color: "#333",
  },
  addCashBtn: {
    marginLeft: "auto",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addCashText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 20,
  },
  searchText: { color: "#0B2D72", marginLeft: 8, fontSize: 16 },
  promoBanner: {
    backgroundColor: "#ffeda6",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    marginBottom: 25,
  },
  promoTextContainer: { flex: 1 },
  promoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    lineHeight: 22,
  },
  promoSub: { fontSize: 18, fontWeight: "700", color: "#333", marginTop: 8 },
  askExpertBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#0B2D72",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  askExpertBtnText: { color: "#0B2D72", fontSize: 10, fontWeight: "600" },
  promoImage: { width: 150, height: 130, borderRadius: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 24, fontWeight: "700", color: "#333" },
  viewAllText: { color: "#0B2D72", fontSize: 20, fontWeight: "600" },
  
  /* STYLES FOR ADDED FILTER */
  skillFilterContainer: {
    marginBottom: 15,
  },
  skillPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  skillPillActive: {
    backgroundColor: "#0B2D72",
    borderColor: "#0B2D72",
  },
  skillPillText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  skillPillTextActive: {
    color: "#FFF",
  },
  noDataText: {
    paddingLeft: 16,
    color: "#999",
    fontStyle: "italic",
  },

  expertBySkillList: { paddingLeft: 16, paddingBottom: 10 },
  skillExpertCard: {
    width: 140,
    backgroundColor: "#F3F0FF",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    marginRight: 15,
  },
  expertInitialCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  expertInitialText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  expertCardName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  starRow: { flexDirection: "row", marginBottom: 8 },
  expertSkillBadge: {
    backgroundColor: "#0B2D72",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  expertSkillText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  expertCardFooter: {
    height: 4,
    width: 60,
    backgroundColor: "#DDD",
    borderRadius: 2,
    marginTop: 12,
  },
  topExpertsList: { paddingLeft: 16, paddingBottom: 10 },
  circularExpertContainer: { marginRight: 15 },
  goldBorder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  circleInitial: { fontSize: 18, fontWeight: "600", color: "#f2f6fb" },
  liveScrollContainer: { paddingLeft: 16 },
  liveCard: {
    width: 130,
    height: 170,
    borderRadius: 18,
    marginRight: 15,
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
});