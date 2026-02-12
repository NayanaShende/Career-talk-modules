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
import { router } from "expo-router";
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
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Find Your Expert</Text>

      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* Recommended Button */}
      <Pressable
        style={styles.recommendedBtn}
        onPress={() => router.push("/recommended")}
      >
        <Text style={styles.recommendedText}>🔥 View Top Experts</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/expert/${item.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>

                <Text style={styles.role}>
                  {item.role || "Expert"} • {item.experience || 5} yrs
                </Text>

                <Text style={styles.rating}>⭐ {item.rating || 4.5}</Text>
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
    padding: 16,
    backgroundColor: "#F3F4F6",
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#000",
  },

  recommendedBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 18,
    elevation: 3,
  },

  recommendedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    elevation: 4,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  role: {
    color: "#6B7280",
    marginTop: 4,
  },

  rating: {
    marginTop: 6,
    fontWeight: "600",
  },
});
