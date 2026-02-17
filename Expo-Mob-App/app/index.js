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
import { router, Redirect } from "expo-router";
import axiosInstance from "../services/api";
import { getAllExperts } from "../services/api.js";


// ✅ CHANGED: removed "export default"
function Home() {
  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);

      let serviceData = [];
      try {
        serviceData = await getAllExperts();
        console.log("SERVICE RESPONSE:", JSON.stringify(serviceData, null, 2));
      } catch (e) {
        console.log("Service failed, fallback to axios");
      }

      let resData = null;
      if (!serviceData || serviceData.length === 0) {
        const res = await axiosInstance.get("/experts");
        console.log("FULL API RESPONSE:", JSON.stringify(res.data, null, 2));
        resData = res.data;
      }

      const data = serviceData?.length ? serviceData : resData;

      let expertsData = [];

      if (Array.isArray(data)) {
        expertsData = data;
      } else if (Array.isArray(data?.data)) {
        expertsData = data.data;
      } else if (Array.isArray(data?.experts)) {
        expertsData = data.experts;
      }

      console.log("EXPERTS COUNT:", expertsData.length);

      setExperts(expertsData);
    } catch (error) {
      console.log("FETCH ERROR:", error?.message);
      console.log("DETAIL:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((e) =>
    (e?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const renderExpert = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/expert/${item.id}`)}
    >
      <View style={styles.cardRow}>
        <Image
          source={{
            uri:
              item.image ||
              item.photo ||
              `https://ui-avatars.com/api/?name=${item.name}`,
          }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.role}>
            {item.role || "Expert"} •{" "}
            {item.experience || item.experience_years || 0} yrs
          </Text>

          <Text style={styles.rating}>⭐ {item.rating || "4.5"}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Find Your Expert</Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      <Pressable
        style={styles.recommendedBtn}
        onPress={() => router.push("/expert/recommended")}
      >
        <Text style={styles.recommendedText}>🔥 View Top Experts</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={filteredExperts}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={renderExpert}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              No experts found from database
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}


// ✅ ONLY ONE DEFAULT EXPORT NOW
export default function Index() {
  return <Redirect href="/welcome" />;
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  dashboardTitle: { fontSize: 26, fontWeight: "bold" },
  subtitle: { color: "#6B7280", marginBottom: 12 },
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
  recommendedText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    elevation: 4,
  },
  cardRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  name: { fontSize: 18, fontWeight: "bold" },
  role: { color: "#6B7280", marginTop: 4 },
  rating: { marginTop: 6, fontWeight: "600" },
});
