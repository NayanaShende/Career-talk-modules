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

const BASE_URL = "http://192.168.1.19:3000";

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

  return (
    <SafeAreaView style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Experts Search</Text>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="#0B2D72"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an expert..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </Pressable>
          )}
        </View>
      </View>

      {/* --- SKILL FILTER --- */}
      <View style={styles.skillContainer}>
        <FlatList
          data={skills}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.skillChip,
                selectedSkill === item && styles.activeChip,
              ]}
              onPress={() => setSelectedSkill(item)}
            >
              <Text
                style={[
                  styles.skillText,
                  selectedSkill === item && styles.activeChipText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B2D72" />
        </View>
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={{ marginTop: 50, color: "#999" }}>
                No experts found.
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const imageUri = getImageUri(item.image, item.name);
            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
              >
                {/* --- IMAGE --- */}
                <View style={styles.imageContainer}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.placeholderImg]}>
                      <Text style={styles.avatarText}>
                        {item?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* --- INFO --- */}
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item?.name}</Text>
                  <Text style={styles.role}>{getExpertDomain(item)}</Text>

                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {item?.rating || "0"}
                    </Text>
                    <Text style={styles.expText}>
                      {item?.experience || 0} years exp
                    </Text>
                  </View>

                  <View style={styles.badge}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: item?.is_online
                            ? "#22C55E"
                            : "#9CA3AF",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        { color: item?.is_online ? "#16A34A" : "#6B7280" },
                      ]}
                    >
                      {item?.is_online ? "Available Now" : "Offline"}
                    </Text>
                  </View>
                </View>

                {/* ✅ FIXED: View + Chat buttons — Chat now goes to expert's chatscreen */}
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
                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color="#0B2D72"
                    />
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#0B2D72",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  card: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  separator: { height: 1, backgroundColor: "#F0F0F0" },
  imageContainer: { marginRight: 15 },
  image: { width: 80, height: 85, borderRadius: 8 },
  placeholderImg: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24, color: "#757575", fontWeight: "bold" },
  infoContainer: { flex: 1, paddingHorizontal: 10, justifyContent: "center" },
  name: { fontSize: 17, fontWeight: "bold", color: "#000" },
  role: { fontSize: 14, color: "#666" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
  expText: { fontSize: 14, color: "#333", marginLeft: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  btnColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: 80,
  },
  viewBtn: {
    backgroundColor: "#0B2D72",
    paddingVertical: 9,
    borderRadius: 10,
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "#0B2D72",
    paddingVertical: 8,
    borderRadius: 10,
    width: 80,
    justifyContent: "center",
  },
  chatBtnText: { color: "#0B2D72", fontWeight: "bold", fontSize: 13 },
  skillContainer: { paddingHorizontal: 15, paddingBottom: 10 },
  skillChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0B2D72",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  activeChip: { backgroundColor: "#0B2D72" },
  skillText: { color: "#0B2D72", fontWeight: "500" },
  activeChipText: { color: "#fff" },
});