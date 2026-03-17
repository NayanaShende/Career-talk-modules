import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TextInput,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { router, Stack } from "expo-router";
import axiosInstance from "../../../services/api";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://192.168.1.14:3000";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const GREEN = "#574964";
const GREEN_DARK = "#574964";
const GREEN_LIGHT = "#f5ecfe";
const GREEN_PALE = "#e5d0f9";
const GREEN_MID = "#e5d5f4";
const WHITE = "#FFFFFF";
const INK = "#0D1F1B";
const MUTED = "#403649";
const BORDER = "#e5d5f4";
const BG = "#f7eeff";

export default function Recommended() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRecommended();
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get("/experts");
      const data = res?.data?.data || [];
      const normalized = data.map((e) => ({
        ...e,
        exp:
          e.experience ??
          e.experience_years ??
          e.yearsOfExperience ??
          e.total_experience ??
          0,
        realRating: parseFloat(e.rating) || 0,
        skillsList: Array.isArray(e.skills)
          ? e.skills.map((s) => s.skill_name)
          : [],
      }));
      const sorted = [...normalized].sort((a, b) => {
        const ratingDiff = (b.realRating || 0) - (a.realRating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.exp || 0) - (a.exp || 0);
      });
      setExperts(sorted.slice(0, 10));
    } catch (error) {
      console.log("Error fetching experts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const animateIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  const animateOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const getImageUri = (image, name) => {
    if (image) {
      const cleanImage = image.replace(/^uploads\//, "");
      return `${BASE_URL}/uploads/${cleanImage}`;
    }
    return `https://ui-avatars.com/api/?name=${name || "Expert"}&background=1F5C4F&color=fff`;
  };

  const renderStars = (rating) => {
    const filled = Math.round(rating);
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= filled ? "star" : "star-outline"}
        size={13}
        color="#F59E0B"
      />
    ));
  };

  const ExpertCard = ({ item }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={styles.card}
        onPressIn={animateIn}
        onPressOut={animateOut}
        onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
      >
        {/* Avatar + online dot */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: getImageUri(item.image, item.name) }}
            style={styles.avatar}
          />
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: item?.is_online ? "#22C55E" : "#9CA3AF" },
            ]}
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || ""}
          </Text>

          {/* Domain tag */}
          <View style={styles.domainTag}>
            <Text style={styles.domainTagText} numberOfLines={1}>
              {item.domain || item.role || "Expert"}
            </Text>
          </View>

          {/* Skills */}
          {item.skillsList.length > 0 && (
            <View style={styles.skillsRow}>
              {item.skillsList.slice(0, 2).map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
              {item.skillsList.length > 2 && (
                <View style={styles.skillChipMore}>
                  <Text style={styles.skillChipMoreText}>
                    +{item.skillsList.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.starGroup}>{renderStars(item.realRating)}</View>
            <Text style={styles.ratingText}>
              {item.realRating > 0 ? item.realRating.toFixed(1) : "—"}
            </Text>
            <View style={styles.expBadge}>
              <Ionicons name="briefcase-outline" size={11} color={GREEN} />
              <Text style={styles.expText}>
                {item.exp > 0 ? `${item.exp}y` : "New"}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item?.is_online ? "#DCFCE7" : "#F3F4F6" },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: item?.is_online ? "#22C55E" : "#9CA3AF" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item?.is_online ? "#16A34A" : "#6B7280" },
              ]}
            >
              {item?.is_online ? "Available Now" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.btnColumn}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() =>
              router.push({
                pathname: "/home/chatscreen",
                params: {
                  expertId: item.userId || item.id,
                  expertName: item.name,
                  expertImage: item.image || "",
                },
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={13} color={GREEN} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </Pressable>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Top Experts</Text>
          <Text style={styles.headerSub}>{experts.length} professionals</Text>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={WHITE} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      {/* ── SEARCH BAR ── */}
      <Animated.View style={[styles.searchWrap, { opacity: searchAnim }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search experts by name…"
            placeholderTextColor="#a49dab"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={MUTED} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* ── COUNT LABEL ── */}
      {!loading && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing{" "}
            <Text style={styles.countNum}>{filteredExperts.length}</Text>{" "}
            experts
          </Text>
        </View>
      )}

      {/* ── LIST ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Finding experts…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          contentContainerStyle={{ paddingBottom: 28, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No experts found</Text>
              <Text style={styles.emptySubText}>
                Try a different search term
              </Text>
            </View>
          }
          renderItem={({ item }) => <ExpertCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: MUTED, fontWeight: "500" },

  // Header
  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  headerTextGroup: { alignItems: "flex-start", flex: 1, paddingLeft: 14 },
  headerTitle: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },

  // Search
  searchWrap: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: INK, fontWeight: "500" },

  // Count
  countRow: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  countText: { fontSize: 13, color: MUTED },
  countNum: { fontWeight: "800", color: GREEN },

  // Card
  card: {
    flexDirection: "row",
    backgroundColor: WHITE,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: GREEN,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Avatar
  avatarWrap: { position: "relative" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN_LIGHT,
    borderWidth: 2.5,
    borderColor: GREEN_PALE,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: WHITE,
  },

  // Info
  infoContainer: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: "800", color: INK, marginBottom: 4 },

  domainTag: {
    alignSelf: "flex-start",
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: GREEN_PALE,
  },
  domainTagText: { fontSize: 11, color: GREEN, fontWeight: "700" },

  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 5,
  },
  skillChip: {
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN_PALE,
  },
  skillChipText: { fontSize: 10, color: GREEN, fontWeight: "700" },
  skillChipMore: {
    backgroundColor: GREEN,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  skillChipMoreText: { fontSize: 10, color: WHITE, fontWeight: "700" },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  starGroup: { flexDirection: "row", gap: 1 },
  ratingText: { fontSize: 12, fontWeight: "700", color: INK },
  expBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expText: { fontSize: 11, color: GREEN, fontWeight: "700" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 10, fontWeight: "700" },

  // Buttons
  btnColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 7,
    marginLeft: 8,
  },
  viewBtn: {
    backgroundColor: GREEN,
    paddingVertical: 9,
    borderRadius: 10,
    width: 72,
    alignItems: "center",
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  viewBtnText: { color: WHITE, fontWeight: "800", fontSize: 13 },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingVertical: 8,
    borderRadius: 10,
    width: 72,
    justifyContent: "center",
    backgroundColor: GREEN_LIGHT,
  },
  chatBtnText: { color: GREEN, fontWeight: "800", fontSize: 12 },

  // Empty
  emptyBox: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: "800", color: INK },
  emptySubText: { fontSize: 13, color: MUTED },
});
