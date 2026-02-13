import { View, Text, StyleSheet, Image, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";

/*
 ✅ Dummy expert database
 You can later replace with API call
*/
const DUMMY_EXPERTS = [
  {
    id: "1",
    name: "Ravi Kumar",
    role: "Software Engineer",
    experience: 5,
    rating: 4.8,
    bio: "Full-stack developer helping students crack tech jobs.",
  },
  {
    id: "2",
    name: "Sneha Patil",
    role: "Data Scientist",
    experience: 4,
    rating: 4.7,
    bio: "ML & AI mentor. Worked with top startups.",
  },
  {
    id: "3",
    name: "Amit Sharma",
    role: "Product Manager",
    experience: 7,
    rating: 4.9,
    bio: "Career coach for product & business roles.",
  },
];

export default function ExpertProfile() {
  const { id } = useLocalSearchParams();

  // find expert by id
  const expert =
    DUMMY_EXPERTS.find((e) => e.id === id) || DUMMY_EXPERTS[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://ui-avatars.com/api/?name=" + expert.name,
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{expert.name}</Text>

        <Text style={styles.role}>
          {expert.role} • {expert.experience} yrs
        </Text>

        <Text style={styles.rating}>⭐ {expert.rating}</Text>

        <Text style={styles.bio}>{expert.bio}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 6,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  role: {
    color: "#64748b",
    marginTop: 6,
  },

  rating: {
    marginTop: 8,
    fontWeight: "600",
  },

  bio: {
    marginTop: 15,
    textAlign: "center",
    color: "#555",
  },
});
