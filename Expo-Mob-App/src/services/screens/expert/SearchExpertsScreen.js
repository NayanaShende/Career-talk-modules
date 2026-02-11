import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { searchExperts } from "../../services/expertService";

export default function SearchExpertsScreen({ navigation }) {
  const [keyword, setKeyword] = useState("");
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text) => {
    setKeyword(text);
    setLoading(true);

    try {
      const data = await searchExperts(text);
      setExperts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Search Error:", error);
      setExperts([]);
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.name}>{item?.name || "No Name"}</Text>

      <Text style={styles.role}>
        {item?.role || "Expert"} • {item?.experience || 0} yrs
      </Text>

      {item?.skills && (
        <Text style={styles.skills}>
          Skills: {Array.isArray(item.skills)
            ? item.skills.join(", ")
            : item.skills}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Experts</Text>

      <TextInput
        style={styles.input}
        placeholder="Search expert..."
        value={keyword}
        onChangeText={handleSearch}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginBottom: 10 }}
        />
      )}

      {!loading && experts.length === 0 && (
        <Text style={styles.noData}>No experts found</Text>
      )}

      <FlatList
        data={experts}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f6fa",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    elevation: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  role: {
    marginTop: 5,
    color: "#555",
  },
  skills: {
    marginTop: 5,
    color: "#777",
    fontSize: 13,
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});
