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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../services/api";
import { getAllExperts } from "../../services/expertService";

export default function Dashboard() {
  const [experts, setExperts] = useState([]);
  const [onlineExperts, setOnlineExperts] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(true);
  const [topExperts, setTopExperts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    fetchExperts();
    fetchOnlineExperts();
    fetchTopExperts();
    const interval = setInterval(fetchOnlineExperts, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchExperts = async () => {
    try {
      const data = await getAllExperts();
      // 🔍 DEBUG: Check your actual data structure in console
      console.log("✅ getAllExperts count:", data?.length);
      console.log("✅ First expert sample:", JSON.stringify(data?.[0], null, 2));
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
      // 🔍 DEBUG: Check skills structure from /experts API
      console.log("✅ /experts first item:", JSON.stringify(list?.[0], null, 2));
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setTopExperts(list.slice(0, 10));
    } catch {
      setTopExperts([]);
    } finally {
      setLoadingTop(false);
    }
  };

  const handleSkillFilter = (skill) => {
    if (selectedSkill === skill) {
      setSelectedSkill(null);
    } else {
      setSelectedSkill(skill);
    }
  };

  // ✅ ROBUST skill matcher — handles ALL common API response formats:
  // • [{ name: "Python" }]         ← object with name
  // • ["Python", "AWS"]            ← plain string array
  // • [{ skill_name: "Python" }]   ← object with skill_name
  // • [{ title: "Python" }]        ← object with title
  // • "Python, AWS, React"         ← comma-separated string
  // • expert.skill / expert.category / expert.expertise  ← root-level fields
  const expertMatchesSkill = (expert, skill) => {
    const skillLower = skill.toLowerCase();

    if (Array.isArray(expert.skills)) {
      return expert.skills.some((s) => {
        if (typeof s === "string") return s.toLowerCase() === skillLower;
        if (typeof s === "object" && s !== null) {
          return (
            s.name?.toLowerCase() === skillLower ||
            s.skill_name?.toLowerCase() === skillLower ||
            s.title?.toLowerCase() === skillLower ||
            s.label?.toLowerCase() === skillLower
          );
        }
        return false;
      });
    }

    // Skills as comma-separated string
    if (typeof expert.skills === "string") {
      return expert.skills.toLowerCase().includes(skillLower);
    }

    // Root-level fallback fields
    return (
      expert.skill?.toLowerCase() === skillLower ||
      expert.category?.toLowerCase() === skillLower ||
      expert.expertise?.toLowerCase()?.includes(skillLower) ||
      expert.specialization?.toLowerCase()?.includes(skillLower)
    );
  };

  // ✅ Use both expert lists — merge & deduplicate by id for widest coverage
  const allExperts = React.useMemo(() => {
    const combined = [...topExperts, ...experts];
    const seen = new Set();
    return combined.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [topExperts, experts]);

  const filteredExperts = selectedSkill
    ? allExperts.filter((expert) => expertMatchesSkill(expert, selectedSkill))
    : topExperts;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar} />
          <Text style={styles.headerText}>Career-Talk</Text>
          <Pressable style={styles.walletBtn}>
            <Text style={styles.walletText}>Add Cash +</Text>
          </Pressable>
        </View>

        {/* SEARCH */}
        <Pressable
          style={styles.searchBox}
          onPress={() => router.push("/expert/search")}
        >
          <Ionicons name="search" size={18} color="#777" />
          <Text style={{ marginLeft: 8, color: "#888" }}>
            Search experts...
          </Text>
        </Pressable>

        {/* CATEGORY FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          style={{ flexGrow: 0 }}
        >
          <Category
            title="Python"
            icon="🐍"
            active={selectedSkill === "Python"}
            onPress={() => handleSkillFilter("Python")}
          />
          <Category
            title="AWS"
            icon="🚀"
            active={selectedSkill === "AWS"}
            onPress={() => handleSkillFilter("AWS")}
          />
          <Category
            title="Power BI"
            icon="📶"
            active={selectedSkill === "Power BI"}
            onPress={() => handleSkillFilter("Power BI")}
          />
          <Category
            title="React.js"
            icon="🔯"
            active={selectedSkill === "React.js"}
            onPress={() => handleSkillFilter("React.js")}
          />
        </ScrollView>

        {/* BANNER */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              What will my future be{"\n"}in the next 5 years?
            </Text>
            <Text>Ask Expert</Text>
          </View>
          <Image
            source={require("../../assets/banner.png")}
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
            source={require("../../assets/new.png")}
            style={styles.bannerImage}
          />
        </View>

        {/* TOP / FILTERED EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedSkill ? `${selectedSkill} Experts` : "Top Experts"}
          </Text>
          <Text
            style={styles.viewAll}
            onPress={() => {
              setSelectedSkill(null);
              router.push("/expert/recommended");
            }}
          >
            View All
          </Text>
        </View>

        {loadingTop ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : filteredExperts.length === 0 && selectedSkill ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No {selectedSkill} experts available right now.
            </Text>
            <Text style={styles.debugText}>
              (Loaded {allExperts.length} experts — check console logs for skills format)
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredExperts.map((e) => (
              <Pressable
                key={e.id}
                style={styles.topExpertCard}
                onPress={() => router.push(`/expert/${e.id}`)}
              >
                <Image
                  source={{
                    uri: e.image || `https://ui-avatars.com/api/?name=${e.name}`,
                  }}
                  style={styles.topExpertImage}
                />
                <Text style={styles.topExpertName}>{e.name}</Text>
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
                name={e.name}
                title={e.role}
                image={e.image || `https://ui-avatars.com/api/?name=${e.name}`}
                onPress={() => router.push(`/expert/${e.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <NavItem icon="🏠" label="Home" active route="/dashboard/dashboard" />
        <NavItem icon="🔎" label="Search" route="/expert/search" />
        <NavItem icon="💬" label="Chat" route="/chat" />
        <NavItem icon="👤" label="Profile" route="/home/profile" />
      </View>
    </SafeAreaView>
  );
}

/* CATEGORY */
const Category = ({ title, icon, onPress, active }) => (
  <Pressable style={styles.categoryItem} onPress={onPress}>
    <View style={[styles.categoryIconWrapper, active && styles.categoryIconActive]}>
      <Text style={styles.categoryIcon}>{icon}</Text>
    </View>
    <Text style={[styles.categoryText, active && { color: "#7C3AED", fontWeight: "700" }]}>
      {title}
    </Text>
  </Pressable>
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

/* NAV ITEM */
const NavItem = ({ icon, label, route, active }) => (
  <Pressable style={styles.navItem} onPress={() => router.push(route)}>
    <Text style={{ fontSize: 20 }}>{icon}</Text>
    <Text style={{ color: active ? "#7C3AED" : "#666", fontSize: 12 }}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F7" },
  header: { flexDirection: "row", alignItems: "center", padding: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#7C3AED" },
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
  categoryRow: { paddingHorizontal: 10, marginTop: 10, alignItems: "center" },
  categoryItem: { alignItems: "center", marginHorizontal: 10 },
  categoryIconWrapper: {
    backgroundColor: "#BDE8F5",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIconActive: { backgroundColor: "#7C3AED" },
  categoryIcon: { fontSize: 24 },
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
  bannerImage: { width: 120, height: 100, resizeMode: "contain" },
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
  emptyState: { alignItems: "center", paddingVertical: 30, paddingHorizontal: 20 },
  emptyText: { color: "#888", fontSize: 14, textAlign: "center" },
  debugText: { color: "#ccc", fontSize: 11, marginTop: 6, textAlign: "center" },
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