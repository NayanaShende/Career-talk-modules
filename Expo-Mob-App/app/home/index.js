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
      <Text style={styles.heading}>Find Your Expert</Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/expert/${item.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item?.name}</Text>

                <Text style={styles.role}>
                  Expert • {item?.experience || 5} yrs
                </Text>

                <Text style={styles.rating}>⭐ {item?.rating || 4.5}</Text>
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
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    padding: 18,
    borderRadius: 22,
    marginBottom: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },
  name: {
    fontSize: 20,
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
