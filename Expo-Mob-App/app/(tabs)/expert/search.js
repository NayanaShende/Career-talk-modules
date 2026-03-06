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
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../services/api";

const BASE_URL = "http://10.89.141.25:3000"; // ✅ NEW

export default function Home() {
  const router = useRouter();

  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  // ✅ NEW: Build full image URL
  const getImageUri = (image, name) => {
    if (image) return `${BASE_URL}/uploads/${image}`;
    return null; // null = show placeholder with initial
  };

  // Logic to filter experts based on search input
  const filteredExperts = experts.filter((e) =>
    e?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e?.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Experts Search </Text>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </View>

      {/* --- SEARCH BAR SECTION --- */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#0B2D72" style={styles.searchIcon} />
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
              <Text style={{ marginTop: 50, color: '#999' }}>No experts found.</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const imageUri = getImageUri(item.image, item.name); // ✅ FIXED: was item.profile_image
            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
              >
                <View style={styles.imageContainer}>
                  {imageUri ? (
                    // ✅ FIXED: Show actual profile image
                    <Image source={{ uri: imageUri }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.placeholderImg]}>
                      <Text style={styles.avatarText}>
                        {item?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item?.name}</Text>
                  <Text style={styles.role}>{item?.role || "UI Designer"}</Text>

                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {item?.rating || "4.9"}({item?.reviews || "234"})
                    </Text>
                    <Text style={styles.expText}>
                      {item?.experience || 8} years exp
                    </Text>
                  </View>

                  <View style={styles.badge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.badgeText}>Available Now</Text>
                  </View>
                </View>

                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  /* HEADER */
  header: {
    backgroundColor: "#0B2D72",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  /* SEARCH BAR */
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  /* CARD LIST */
  card: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  imageContainer: {
    marginRight: 15,
  },
  image: {
    width: 80,
    height: 85,
    borderRadius: 8,
  },
  placeholderImg: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    color: "#757575",
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
  },
  role: {
    fontSize: 14,
    color: "#666",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  expText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
  },
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
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0B2D72",
    marginRight: 6,
  },
  badgeText: {
    color: "#0B2D72",
    fontSize: 12,
    fontWeight: "600",
  },
  viewBtn: {
    backgroundColor: "#0B2D72",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});