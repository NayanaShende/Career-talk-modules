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
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { router, Stack } from "expo-router";
import axiosInstance from "../../../services/api";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://192.168.1.3:3000";

export default function Recommended() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get("/experts");
      const data = res?.data?.data || [];

      const normalized = data.map((e) => ({
        ...e,
        // ✅ FIXED: correct experience field name from your DB
        exp: e.experience ?? e.experience_years ?? e.yearsOfExperience ?? e.total_experience ?? 0,
        // ✅ FIXED: correct rating field from your DB
        realRating: parseFloat(e.rating) || 0,
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
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const getImageUri = (image, name) => {
    if (image) return `${BASE_URL}/uploads/${image}`;
    return `https://ui-avatars.com/api/?name=${name || "Expert"}&background=0B2D72&color=fff`;
  };

  // ✅ NEW: Render real stars
  const renderStars = (rating) => {
    const filled = Math.round(rating);
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= filled ? "star" : "star-outline"}
        size={14}
        color="#FFD700"
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Top Experts</Text>
        <Pressable>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B2D72" />
        </View>
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={styles.card}
                onPressIn={animateIn}
                onPressOut={animateOut}
                onPress={() => router.push(`/(tabs)/expert/${item.id}`)}
              >
                <Image
                  source={{ uri: getImageUri(item.image, item.name) }}
                  style={styles.avatar}
                />

                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item.name || ""}</Text>
                  <Text style={styles.role}>{item.domain || item.role || "Expert"}</Text>
                  
                  <View style={styles.statsRow}>
                    {/* ✅ FIXED: Real stars from DB */}
                    {renderStars(item.realRating)}
                    <Text style={styles.ratingText}>
                      {item.realRating > 0 ? item.realRating.toFixed(1) : "No rating"}
                    </Text>
                    {/* ✅ FIXED: Real experience from DB */}
                    <Text style={styles.expText}>
                      {item.exp > 0 ? `${item.exp} yrs exp` : "New"}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.statusText}>Available Now</Text>
                  </View>
                </View>

                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View</Text>
                </View>
              </Pressable>
            </Animated.View>
          )}
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
  header: {
    backgroundColor: "#0B2D72",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  filterTab: {
    flex: 1,
    height: 35,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#0B2D72",
  },
  filterText: {
    color: "#0B2D72",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
    color: "#333",
  },
  expText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0B2D72",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: "#0B2D72",
    fontWeight: "600",
  },
  viewBtn: {
    backgroundColor: "#0B2D72",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  viewBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});