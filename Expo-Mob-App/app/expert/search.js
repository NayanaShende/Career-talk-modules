import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../services/api";


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

  const filteredExperts = experts.filter((e) =>
    e?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* 🔥 NEW CURVED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Experts</Text>
        <Ionicons name="menu" size={26} color="#fff" />
      </View>

      {/* 🔥 SEARCH WITH ICON */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          style={{ marginLeft: 8, flex: 1 }}
          placeholder="Search expert..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/expert/${item.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item?.name?.charAt(0).toUpperCase()}
                </Text>

                {/* ONLINE DOT */}
                <View style={styles.onlineDot} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item?.name}</Text>

                <Text style={styles.role}>
                  Expert • {item?.experience || 5} yrs
                </Text>

                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FACC15" />
                  <Text style={styles.rating}>{item?.rating || 4.5}</Text>
                </View>
              </View>

              {/* 🔥 VIEW BUTTON */}
              <View style={styles.viewBtn}>
                <Text style={styles.viewText}>View</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F7",
  },

  /* HEADER */
  header: {
    backgroundColor: "#3B5BDB",
    paddingTop: 20,
    paddingBottom: 26,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -18,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 22,
    elevation: 4,
  },

  /* CARD */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    elevation: 3,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },

  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  role: {
    color: "#6B7280",
    marginTop: 3,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  rating: {
    marginLeft: 6,
    fontWeight: "600",
  },

  viewBtn: {
    backgroundColor: "#2F6BFF",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },

  viewText: {
    color: "#fff",
    fontWeight: "600",
  },
});