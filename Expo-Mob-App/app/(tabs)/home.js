import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import { getOnlineExperts } from "../../services/expertService";

export default function Home() {
  const [onlineExperts, setOnlineExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnlineExperts();
  }, []);

  const loadOnlineExperts = async () => {
    try {
      const data = await getOnlineExperts();
      setOnlineExperts(data);
    } catch (e) {
      console.log("Dashboard Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.image || "https://i.pravatar.cc/150?img=12",
        }}
        style={styles.image}
      />

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.online}>🟢 Online</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Online Experts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : onlineExperts.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No experts online</Text>
      ) : (
        <FlatList
          data={onlineExperts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    elevation: 3,
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  name: {
    marginTop: 6,
    fontWeight: "600",
  },

  online: {
    color: "green",
    fontWeight: "bold",
    marginTop: 2,
  },
});
