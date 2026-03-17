import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../services/api";

const BASE_URL = "http://192.168.1.14:3000";

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#574964";
const TEAL_LIGHT = "#f6ebff";
const TEAL_TEXT = "#574964";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#eff0f2";

export default function Home() {
  const router = useRouter();

  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState("All");

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const res = await axiosInstance.get("/experts");
      setExperts(res?.data?.data || []);
    } catch (error) {
      console.log("Error fetching experts:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUri = (image, name) => {
    if (image) {
      const cleanImage = image.replace(/^uploads\//, "");
      return `${BASE_URL}/uploads/${cleanImage}`;
    }
    return null;
  };

  const getExpertDomain = (item) => {
    if (item?.domain) return item.domain;
    if (Array.isArray(item?.skills) && item.skills.length > 0) {
      return item.skills[0].skill_name;
    }
    return item?.role || "Expert";
  };

  const filteredExperts = experts.filter((e) => {
    const matchesSearch =
      e?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e?.domain?.toLowerCase().includes(search.toLowerCase()) ||
      e?.role?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(e?.skills) &&
        e.skills.some((s) =>
          s.skill_name?.toLowerCase().includes(search.toLowerCase()),
        ));

    const matchesSkill =
      selectedSkill === "All" ||
      (Array.isArray(e?.skills) &&
        e.skills.some(
          (s) => s.skill_name?.toLowerCase() === selectedSkill.toLowerCase(),
        ));

    return matchesSearch && matchesSkill;
  });

  const skills = [
    "All",
    "React",
    "React Native",
    "Python",
    "Node.js",
    "Java",
    "Angular",
    "DevOps",
    "UI/UX Design",
    "Data Analysis",
    "Machine Learning",
    "PHP",
    "Flutter",
  ];

  // ── Expert list card ───────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const imageUri = getImageUri(item.image, item.name);
    const initials = item?.name
      ? item.name
          .trim()
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "EX";
    const rating = parseFloat(item?.rating) || 0;
    const stars = Math.round(rating);

    // soft avatar bg cycle
    const BG_CYCLE = ["#4a4869", "#2d6a5e", "#7a3d5e", "#1f5c8a", "#5e4a2d"];
    const avatarBg = BG_CYCLE[index % BG_CYCLE.length];

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
      >
        {/* ── Avatar ── */}
        <View style={styles.avatarWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImg} />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: avatarBg }]}
            >
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          {/* online dot */}
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: item?.is_online ? "#22C55E" : "#9CA3AF" },
            ]}
          />
        </View>

        {/* ── Info ── */}
        <View style={styles.infoCol}>
          <Text style={styles.expertName} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text style={styles.expertRole} numberOfLines={1}>
            {getExpertDomain(item)}
          </Text>

          {/* stars + experience */}
          <View style={styles.metaRow}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= stars ? "star" : "star-outline"}
                  size={12}
                  color={s <= stars ? "#F5C518" : "#DDD"}
                />
              ))}
              <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.expPill}>
              <Ionicons name="briefcase-outline" size={11} color={TEAL_TEXT} />
              <Text style={styles.expPillText}>
                {item?.experience || 0} yrs
              </Text>
            </View>
          </View>

          {/* availability badge */}
          <View
            style={[
              styles.availBadge,
              { backgroundColor: item?.is_online ? "#dcfce7" : "#f3f4f6" },
            ]}
          >
            <View
              style={[
                styles.availDot,
                { backgroundColor: item?.is_online ? "#22C55E" : "#9CA3AF" },
              ]}
            />
            <Text
              style={[
                styles.availText,
                { color: item?.is_online ? "#16a34a" : "#6b7280" },
              ]}
            >
              {item?.is_online ? "Available Now" : "Offline"}
            </Text>
          </View>
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.btnCol}>
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
            <Ionicons name="chatbubble-outline" size={13} color={TEAL_TEXT} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={CARD_BG} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Find an Expert</Text>
          <Text style={styles.headerSub}>
            {experts.length} experts available
          </Text>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={CARD_BG} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      {/* ── SEARCH BAR ─────────────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#AAAAAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search experts, skills, roles..."
            placeholderTextColor="#AAAAAA"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#CCCCCC" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── SKILL FILTER ───────────────────────────────────────────────── */}
      <View style={styles.filterWrap}>
        <FlatList
          data={skills}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSkill === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSkill(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSkill === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── RESULTS COUNT ──────────────────────────────────────────────── */}
      {!loading && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filteredExperts.length} result
            {filteredExperts.length !== 1 ? "s" : ""}
            {selectedSkill !== "All" ? ` for "${selectedSkill}"` : ""}
          </Text>
        </View>
      )}

      {/* ── LIST ───────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={styles.loadingText}>Finding experts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={32} color={TEAL} />
              </View>
              <Text style={styles.emptyTitle}>No experts found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search term or skill filter
              </Text>
            </View>
          )}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_2,
    fontWeight: "500",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginTop: 22,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
    fontWeight: "500",
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e53935",
    position: "absolute",
    top: 7,
    right: 7,
    borderWidth: 1.5,
    borderColor: TEAL,
  },

  // ── Search ──
  searchWrap: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f5f7",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_1,
    fontWeight: "500",
  },

  // ── Skill Filter ──
  filterWrap: {
    backgroundColor: CARD_BG,
    paddingBottom: 12,
    paddingTop: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#D0D0D8",
    backgroundColor: CARD_BG,
  },
  filterChipActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },
  filterChipTextActive: {
    color: "#fff",
  },

  // ── Results count ──
  resultsRow: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  resultsText: {
    fontSize: 13,
    color: TEXT_2,
    fontWeight: "600",
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
  },

  // ── Expert Card ──
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },

  // ── Avatar ──
  avatarWrap: {
    position: "relative",
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: CARD_BG,
  },

  // ── Info ──
  infoCol: {
    flex: 1,
    gap: 3,
  },
  expertName: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_1,
    letterSpacing: -0.2,
  },
  expertRole: {
    fontSize: 13,
    color: TEXT_2,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingNum: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_1,
    marginLeft: 3,
  },
  expPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 50,
  },
  expPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEAL_TEXT,
  },
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 50,
    marginTop: 3,
    gap: 5,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Buttons ──
  btnCol: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  viewBtn: {
    backgroundColor: TEAL,
    paddingVertical: 9,
    borderRadius: 12,
    width: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: TEAL,
    paddingVertical: 8,
    borderRadius: 12,
    width: 76,
    justifyContent: "center",
    backgroundColor: TEAL_LIGHT,
  },
  chatBtnText: {
    color: TEAL_TEXT,
    fontWeight: "800",
    fontSize: 13,
  },

  // ── Empty state ──
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
  },
  emptySubtitle: {
    fontSize: 13,
    color: TEXT_2,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
