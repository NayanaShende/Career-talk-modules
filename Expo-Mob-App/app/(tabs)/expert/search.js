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
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../services/api";

import { BASE_URL } from "../../../constants/config";

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#f6ebff";
const TEAL_TEXT = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#eff0f2";

// ── Search filter types ────────────────────────────────────────────────────
const SEARCH_FILTERS = [
  { key: "All", icon: "apps-outline" },
  { key: "Name", icon: "person-outline" },
  { key: "Domain", icon: "layers-outline" },
  { key: "Subdomain", icon: "git-branch-outline" },
  { key: "Skills", icon: "code-slash-outline" },
];

// ── Skill quick-filter chips ───────────────────────────────────────────────
const SKILL_CHIPS = [
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

export default function Home() {
  const router = useRouter();

  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [searchFilter, setSearchFilter] = useState("All");

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const res = await axiosInstance.get("/experts");
      const raw = res?.data?.data || [];
      // Normalize subdomain field — adjust key to match your API
      const normalized = raw.map((e) => ({
        ...e,
        subDomain: e.sub_domain ?? e.subdomain ?? e.subDomain ?? "",
      }));
      setExperts(normalized);
    } catch (error) {
      console.log("Error fetching experts:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUri = (image) => {
    if (image) {
      // ✅ If already a full Cloudinary or external URL, return as-is
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }
      // ✅ Otherwise it's a local file, prepend base URL
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

  // ── Filtering Logic ────────────────────────────────────────────────────────
  const filteredExperts = experts.filter((e) => {
    // Skill quick-filter chip
    const matchesSkillChip =
      selectedSkill === "All" ||
      (Array.isArray(e?.skills) &&
        e.skills.some(
          (s) => s.skill_name?.toLowerCase() === selectedSkill.toLowerCase(),
        ));

    // Search bar filter
    const q = search.toLowerCase().trim();
    let matchesSearch = true;
    if (q) {
      switch (searchFilter) {
        case "Name":
          matchesSearch = e?.name?.toLowerCase().includes(q);
          break;
        case "Domain":
          matchesSearch =
            e?.domain?.toLowerCase().includes(q) ||
            e?.role?.toLowerCase().includes(q);
          break;
        case "Subdomain":
          matchesSearch = e?.subDomain?.toLowerCase().includes(q);
          break;
        case "Skills":
          matchesSearch =
            Array.isArray(e?.skills) &&
            e.skills.some((s) => s.skill_name?.toLowerCase().includes(q));
          break;
        case "All":
        default:
          matchesSearch =
            e?.name?.toLowerCase().includes(q) ||
            e?.domain?.toLowerCase().includes(q) ||
            e?.role?.toLowerCase().includes(q) ||
            e?.subDomain?.toLowerCase().includes(q) ||
            (Array.isArray(e?.skills) &&
              e.skills.some((s) => s.skill_name?.toLowerCase().includes(q)));
      }
    }

    return matchesSkillChip && matchesSearch;
  });

  const getPlaceholder = () => {
    switch (searchFilter) {
      case "Name":
        return "Search by expert name…";
      case "Domain":
        return "Search by domain or role…";
      case "Subdomain":
        return "Search by subdomain…";
      case "Skills":
        return "Search by skill (e.g. React, Python)…";
      default:
        return "Search experts, skills, domain…";
    }
  };

  // ── Highlight matched text ─────────────────────────────────────────────────
  const HighlightText = ({ text, style, numberOfLines }) => {
    const q = search.trim();
    const shouldHighlight =
      q &&
      (searchFilter === "All" ||
        searchFilter === "Name" ||
        searchFilter === "Domain" ||
        searchFilter === "Subdomain");

    if (!shouldHighlight || !text) {
      return (
        <Text style={style} numberOfLines={numberOfLines}>
          {text}
        </Text>
      );
    }
    const regex = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <Text key={i} style={[style, styles.highlight]}>
              {part}
            </Text>
          ) : (
            part
          ),
        )}
      </Text>
    );
  };

  // ── Expert list card ───────────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const imageUri = getImageUri(item.image);
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

    const BG_CYCLE = ["#4a4869", "#2d6a5e", "#7a3d5e", "#1f5c8a", "#5e4a2d"];
    const avatarBg = BG_CYCLE[index % BG_CYCLE.length];

    const skillsList = Array.isArray(item?.skills)
      ? item.skills.map((s) => s.skill_name)
      : [];

    const q = search.toLowerCase().trim();

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
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: item?.is_online ? "#22C55E" : "#9CA3AF" },
            ]}
          />
        </View>

        {/* ── Info ── */}
        <View style={styles.infoCol}>
          {/* Name */}
          <HighlightText
            text={item?.name}
            style={styles.expertName}
            numberOfLines={1}
          />

          {/* Domain */}
          <HighlightText
            text={getExpertDomain(item)}
            style={styles.expertRole}
            numberOfLines={1}
          />

          {/* Subdomain — shown only if present */}
          {!!item.subDomain && (
            <View style={styles.subDomainRow}>
              <Ionicons name="git-branch-outline" size={10} color={TEXT_2} />
              <HighlightText
                text={item.subDomain}
                style={styles.subDomainText}
                numberOfLines={1}
              />
            </View>
          )}

          {/* Skills chips */}
          {skillsList.length > 0 && (
            <View style={styles.skillsRow}>
              {skillsList.slice(0, 2).map((skill, i) => {
                const isMatch =
                  (searchFilter === "Skills" || searchFilter === "All") &&
                  q &&
                  skill.toLowerCase().includes(q);
                return (
                  <View
                    key={i}
                    style={[
                      styles.skillChip,
                      isMatch && styles.skillChipMatched,
                    ]}
                  >
                    <Text
                      style={[
                        styles.skillChipText,
                        isMatch && styles.skillChipTextMatched,
                      ]}
                    >
                      {skill}
                    </Text>
                  </View>
                );
              })}
              {skillsList.length > 2 && (
                <View style={styles.skillChipMore}>
                  <Text style={styles.skillChipMoreText}>
                    +{skillsList.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Stars + experience */}
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

          {/* Availability badge */}
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
            placeholder={getPlaceholder()}
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

        {/* ── SEARCH FILTER CHIPS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.searchFilterRow}
        >
          {SEARCH_FILTERS.map(({ key, icon }) => {
            const isActive = searchFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.searchFilterChip,
                  isActive && styles.searchFilterChipActive,
                ]}
                onPress={() => {
                  setSearchFilter(key);
                  setSearch("");
                }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={icon}
                  size={12}
                  color={isActive ? "#fff" : TEAL_TEXT}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.searchFilterText,
                    isActive && styles.searchFilterTextActive,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── SKILL QUICK-FILTER ─────────────────────────────────────────── */}
      <View style={styles.filterWrap}>
        <FlatList
          data={SKILL_CHIPS}
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
            {search.trim()
              ? ` for "${search}" in ${searchFilter}`
              : selectedSkill !== "All"
                ? ` for "${selectedSkill}"`
                : ""}
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
                Try a different {searchFilter.toLowerCase()} or switch filters
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
  container: { flex: 1, backgroundColor: PAGE_BG },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: TEXT_2, fontWeight: "500" },

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
  headerCenter: { flex: 1, paddingHorizontal: 12 },
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
    gap: 10,
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
  searchInput: { flex: 1, fontSize: 14, color: TEXT_1, fontWeight: "500" },

  // ── Search filter chips ──
  searchFilterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  searchFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: "#D0D0D8",
  },
  searchFilterChipActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  searchFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEAL_TEXT,
  },
  searchFilterTextActive: {
    color: "#fff",
  },

  // ── Skill quick-filter ──
  filterWrap: {
    backgroundColor: CARD_BG,
    paddingBottom: 12,
    paddingTop: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#D0D0D8",
    backgroundColor: CARD_BG,
  },
  filterChipActive: { backgroundColor: TEAL, borderColor: TEAL },
  filterChipText: { fontSize: 13, fontWeight: "700", color: "#555" },
  filterChipTextActive: { color: "#fff" },

  // ── Results count ──
  resultsRow: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 },
  resultsText: { fontSize: 13, color: TEXT_2, fontWeight: "600" },

  // ── List ──
  listContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },

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
  avatarWrap: { position: "relative" },
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
  avatarInitials: { color: "#fff", fontSize: 20, fontWeight: "800" },
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
  infoCol: { flex: 1, gap: 3 },
  expertName: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_1,
    letterSpacing: -0.2,
  },
  expertRole: { fontSize: 13, color: TEXT_2, fontWeight: "500" },

  subDomainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  subDomainText: {
    fontSize: 11,
    color: TEXT_2,
    fontWeight: "600",
  },

  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  skillChip: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0d0f0",
  },
  skillChipMatched: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  skillChipText: { fontSize: 10, color: TEAL_TEXT, fontWeight: "700" },
  skillChipTextMatched: { color: "#fff" },
  skillChipMore: {
    backgroundColor: TEAL,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  skillChipMoreText: { fontSize: 10, color: "#fff", fontWeight: "700" },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
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
  expPillText: { fontSize: 11, fontWeight: "700", color: TEAL_TEXT },

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
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontSize: 11, fontWeight: "700" },

  // ── Buttons ──
  btnCol: { flexDirection: "column", alignItems: "center", gap: 8 },
  viewBtn: {
    backgroundColor: TEAL,
    paddingVertical: 9,
    borderRadius: 12,
    width: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
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
  chatBtnText: { color: TEAL_TEXT, fontWeight: "800", fontSize: 13 },

  // ── Highlight ──
  highlight: {
    backgroundColor: "#FFE680",
    color: "#6B4F00",
    borderRadius: 3,
  },

  // ── Empty state ──
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: TEXT_1 },
  emptySubtitle: {
    fontSize: 13,
    color: TEXT_2,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
