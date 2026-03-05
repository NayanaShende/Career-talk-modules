import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

/* ---------------- CALL LOG DATA ---------------- */
const callData = [
  {
    id: "1",
    name: "Happy Tails Animal Rescue",
    status: "Outgoing",
    date: "Yesterday",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: "2",
    name: "City Critters Adoption Center",
    status: "Missed",
    date: "Sunday",
    avatar: "https://i.pravatar.cc/100?img=22",
  },
  {
    id: "3",
    name: "Purr Haven Shelter",
    status: "Outgoing",
    date: "Sunday",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
];

/* ---------------- CHAT DATA ---------------- */
const chatData = [
  {
    id: "1",
    name: "Dr. Sarah Williams",
    lastMessage: "Try reducing screen time before bed.",
    time: "2:30 PM",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: "2",
    name: "Mindfulness Coach Alex",
    lastMessage: "How did the breathing exercise go?",
    time: "Yesterday",
    avatar: "https://i.pravatar.cc/100?img=15",
  },
  {
    id: "3",
    name: "Therapist John",
    lastMessage: "Let's review your progress tomorrow.",
    time: "Sunday",
    avatar: "https://i.pravatar.cc/100?img=25",
  },
];

export default function ChatLogs() {
  const [activeTab, setActiveTab] = useState("Calls");

  /* ---------- CALL ITEM ---------- */
  const renderCallItem = ({ item }) => (
    <View style={styles.row}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>

      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  /* ---------- CHAT ITEM ---------- */
  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.row}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.lastMessage}</Text>
      </View>

      <Text style={styles.date}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.back}>←</Text>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.filter}>⚙️</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Chats" && styles.activeTab]}
          onPress={() => setActiveTab("Chats")}
        >
          <Text
            style={[styles.tabText, activeTab === "Chats" && styles.activeText]}
          >
            Chats (3)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Calls" && styles.activeTab]}
          onPress={() => setActiveTab("Calls")}
        >
          <Text
            style={[styles.tabText, activeTab === "Calls" && styles.activeText]}
          >
            Calls
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Switch */}
      <FlatList
        data={activeTab === "Calls" ? callData : chatData}
        renderItem={activeTab === "Calls" ? renderCallItem : renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
  },

  back: { fontSize: 20 },
  filter: { fontSize: 18 },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#e9e9e9",
    margin: 12,
    borderRadius: 10,
    overflow: "hidden",
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#0B2D72",
  },

  tabText: {
    color: "#444",
    fontWeight: "500",
  },

  activeText: {
    color: "#fff",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  status: {
    color: "#777",
    marginTop: 2,
  },

  date: {
    color: "#999",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 72,
  },
});
