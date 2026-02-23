import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { getOnlineExperts } from "../../../services/expertService";  // ✅ Fixed path
export default function OnlineExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      const data = await getOnlineExperts();
      setExperts(data || []);
    } catch (e) {
      console.log("ONLINE LOAD ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/expert/${item.id}`)}
    >
      <Image
        source={{
          uri: item.image || "https://i.pravatar.cc/150?img=12",
        }}
        style={styles.image}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.role}>
          {item.headline || item.role || "Expert"}
        </Text>

        <Text style={styles.rating}>⭐ {item.rating || 0}</Text>

        <Text style={styles.online}>🟢 Online</Text>
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Online Experts",
          headerTitleAlign: "center",
        }}
      />

      <SafeAreaView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <FlatList
            data={experts}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
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

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },

  name: {
    fontSize: 17,
    fontWeight: "bold",
  },

  role: {
    color: "#6B7280",
    marginTop: 3,
  },

  rating: {
    marginTop: 4,
    fontWeight: "600",
  },

  online: {
    marginTop: 3,
    color: "green",
    fontWeight: "bold",
  },
});