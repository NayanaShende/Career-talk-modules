import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { router, Stack } from "expo-router";   // ✅ Added Stack here
import axiosInstance from "../../services/api";

export default function Recommended() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get("/experts/recommended");
      setExperts(res?.data?.data || []);
    } catch (error) {
      console.log("Error fetching recommended experts:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ FIXED HEADER TITLE */}
      <Stack.Screen
        options={{
          title: "Top Recommended Experts",
          headerTitleAlign: "center",
        }}
      />

      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>🔥 Top Recommended Experts</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <FlatList
            data={experts}
            keyExtractor={(item, index) =>
              item?.id ? item.id.toString() : index.toString()
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/expert/${item.id}`)}
              >
                <Text style={styles.name}>{item?.name}</Text>

                <Text style={styles.role}>
                  {item?.role || "Expert"} • {item?.experience || 5} yrs
                </Text>

                <Text style={styles.rating}>
                  ⭐ {item?.rating || 4.5}
                </Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
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
