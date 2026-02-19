import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";

/* ✅ NEW (API import) */
import { getAllExperts } from "../../services/expertService";

export default function Dashboard() {

  /* ✅ NEW (state) */
  const [experts, setExperts] = useState([]);

  /* ✅ NEW (fetch experts on load) */
  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const data = await getAllExperts();
      setExperts(data || []);
    } catch (err) {
      console.log("Dashboard fetch error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>CareerTalk</Text>

        <TextInput
          placeholder="Search experts, skills..."
          placeholderTextColor="#94A3B8"
          style={styles.search}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* WELCOME */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome back 👋</Text>
          <Text style={styles.welcomeSub}>
            Find mentors and grow your career today
          </Text>
        </View>

        {/* BUTTON GRID */}
        <View style={styles.grid}>

          {/* Search */}
          <Pressable
            style={[styles.gridCard, { backgroundColor: "#FF9B00" }]}
            onPress={() => router.push("/home")}
          >
            <Text style={styles.gridIcon}>🔎</Text>
            <Text style={styles.gridText}>Search Experts</Text>
          </Pressable>

          {/* Recommended */}
          <Pressable
            style={[styles.gridCard, { backgroundColor: "#6D28D9" }]}
            onPress={() => router.push("/expert/recommended")}
          >
            <Text style={styles.gridIcon}>🔥</Text>
            <Text style={styles.gridText}>Top Experts</Text>
          </Pressable>

          {/* Profile (✅ dynamic id from DB) */}
          <Pressable
            style={[styles.gridCard, { backgroundColor: "#D34E4E" }]}
            onPress={() => {
              if (experts.length > 0) {
                router.push(`/expert/${experts[0].id}`);
              } else {
                console.log("No experts found");
              }
            }}
          >
            <Text style={styles.gridIcon}>👤</Text>
            <Text style={styles.gridText}>Profile</Text>
          </Pressable>

          {/* Messages */}
          <Pressable
            style={[styles.gridCard, { backgroundColor: "#7C4585" }]}
          >
            <Text style={styles.gridIcon}>💬</Text>
            <Text style={styles.gridText}>Messages</Text>
          </Pressable>

        </View>

        {/* FEED */}
        <Text style={styles.sectionTitle}>Recommended for you</Text>

        <View style={styles.feedCard}>
          <Text style={styles.feedTitle}>Top React Mentor Available</Text>
          <Text style={styles.feedSub}>
            8+ years experience • Book session now
          </Text>
        </View>

        <View style={styles.feedCard}>
          <Text style={styles.feedTitle}>Career Guidance Session</Text>
          <Text style={styles.feedSub}>
            Resume review • Mock interviews • Roadmap
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#5A7ACD",
    elevation: 4,
  },

  logo: {
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 12,
    color: "#ffffff",
  },

  search: {
    flex: 1,
    backgroundColor: "#EEF2F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },

  welcome: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },

  welcomeSub: {
    marginTop: 6,
    color: "#64748B",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  gridCard: {
    width: "48%",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  gridIcon: {
    fontSize: 30,
    marginBottom: 10,
    color: "#FFFFFF",
  },

  gridText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 15,
  },

  sectionTitle: {
    marginLeft: 15,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 16,
    color: "#0F172A",
  },

  feedCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  feedTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#0F172A",
  },

  feedSub: {
    marginTop: 6,
    color: "#64748B",
  },

});
