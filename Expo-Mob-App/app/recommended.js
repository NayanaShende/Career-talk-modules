import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import axiosInstance from "../src/services/api";

export default function Recommended() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get("/experts/recommended");
      setExperts(res.data.data || []);
    } catch (error) {
      console.log("Recommended error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderExpert = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/expert/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.photo ||
            "https://ui-avatars.com/api/?name=" + item.name,
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.role}>
        {item.role || "Expert"} • {item.experience || 0} yrs
      </Text>

      <Text style={styles.rating}>⭐ {item.rating || "4.8"}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Top Rated Experts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={experts}
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
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
});
