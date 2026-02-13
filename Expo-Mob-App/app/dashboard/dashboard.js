import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text style={styles.title}>Career Talk</Text>
          <Text style={styles.subtitle}>
            Welcome 👋 Find the best experts for your career
          </Text>
        </View>

        {/* ================= CARDS ================= */}

        {/* Search Experts */}
        <Pressable
          style={[styles.card, { backgroundColor: "#2563EB" }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.icon}>🔎</Text>
          <View>
            <Text style={styles.cardTitle}>Search Experts</Text>
            <Text style={styles.cardSub}>Find experts by skill & name</Text>
          </View>
        </Pressable>

        {/* Top Experts */}
        <Pressable
          style={[styles.card, { backgroundColor: "#7C3AED" }]}
          onPress={() => router.push("/recommended")}
        >
          <Text style={styles.icon}>🔥</Text>
          <View>
            <Text style={styles.cardTitle}>Top Rated Experts</Text>
            <Text style={styles.cardSub}>Best professionals this week</Text>
          </View>
        </Pressable>

        {/* Profile Demo */}
        <Pressable
          style={[styles.card, { backgroundColor: "#059669" }]}
          onPress={() => router.push("/expert/1")}
        >
          <Text style={styles.icon}>👤</Text>
          <View>
            <Text style={styles.cardTitle}>View Sample Profile</Text>
            <Text style={styles.cardSub}>Check expert details page</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 18,
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },

  /* ================= CARD ================= */

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  icon: {
    fontSize: 30,
    marginRight: 18,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  cardSub: {
    color: "#E2E8F0",
    fontSize: 13,
    marginTop: 4,
  },
});
