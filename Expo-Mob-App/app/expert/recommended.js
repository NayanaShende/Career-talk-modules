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
import { router, Stack } from "expo-router";
import axiosInstance from "../../services/api";

export default function Recommended() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const res = await axiosInstance.get("/experts");

      const data = res?.data?.data || [];

      // normalize experience field
      const normalized = data.map((e) => ({
        ...e,
        exp:
          e.experience_years ??
          e.experience ??
          e.yearsOfExperience ??
          e.total_experience ??
          0,
      }));

      // sort by rating then experience
      const sorted = [...normalized].sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.exp || 0) - (a.exp || 0);
      });

      // show only top 10 experts
      setExperts(sorted.slice(0, 10));
    } catch (error) {
      console.log("Error fetching experts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              item.id ? item.id.toString() : index.toString()
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/expert/${item.id}`)}
              >
                <Text style={styles.name}>{item.name}</Text>

                <Text style={styles.role}>
                  {item.role || "Expert"} • {item.exp} yrs
                </Text>

                <Text style={styles.rating}>⭐ {item.rating || 0}</Text>
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