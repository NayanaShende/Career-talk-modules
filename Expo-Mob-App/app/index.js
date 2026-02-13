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
import { router } from "expo-router";
import "expo-router/entry";
import axiosInstance from "../src/services/api";

export default function Home() {
  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const res = await axiosInstance.get("/experts");
      setExperts(res.data.data || []);
    } catch (error) {
      console.log("Error fetching experts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const renderExpert = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/expert/${item.id}`)}
    >
      <View style={styles.cardRow}>
        <Image
          source={{
            uri: item.photo || "https://ui-avatars.com/api/?name=" + item.name,
          }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>
            {item.role || "Expert"} • {item.experience || 0} yrs
          </Text>
          <Text style={styles.rating}>⭐ {item.rating || "4.5"}</Text>
        </View>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Find Your Dream Career</Text>
          <Text style={styles.heroSub}>
            Search from 10,000+ experts & get guidance
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ================= Dashboard Header ================= */}
      <Text style={styles.dashboardTitle}>Career Talk Dashboard</Text>
      <Text style={styles.subtitle}>Welcome 👋 Explore Experts Below</Text>

      <View style={styles.dashboardRow}>
        <Pressable
          style={styles.dashboardBtn}
          onPress={() => router.push("/recommended")}
        >
          <Text style={styles.dashboardText}>🔥 Top Experts</Text>
        </Pressable>
      </View>

      {/* ================= Search ================= */}
      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        value={search}
        onChangeText={setSearch}
      />

      {/* ================= Expert List ================= */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : filteredExperts.length === 0 ? (
        <Text style={styles.empty}>No experts found</Text>
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpert}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f1f5f9",
  },

  hero: {
    backgroundColor: "#6366F1",
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  heroSub: {
    color: "#e0e7ff",
    marginTop: 6,
  },

  /* ===== Dashboard ===== */
  dashboardTitle: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#6B7280",
    marginBottom: 12,
  },
  dashboardRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  dashboardBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
  },
  dashboardText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* ===== Search ===== */
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  /* ===== Cards ===== */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  role: {
    color: "#64748b",
    marginTop: 4,
  },
  rating: {
    marginTop: 6,
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
  },
});
