import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";

const messages = [
  {
    id: "1",
    text: "Hi Jay, let's plan our trip to Toronto this week.",
    sender: "bot",
    time: "9:35 AM",
  },
  {
    id: "2",
    text: "Voice call",
    sender: "bot",
    type: "call",
    time: "9:35 AM",
  },
  {
    id: "3",
    text: "Video call",
    sender: "user",
    type: "video",
    time: "10:00 AM",
  },
  {
    id: "4",
    text: "Missed call",
    sender: "user",
    type: "video",
    time: "10:00 AM",
  },
  {
    id: "5",
    text: "30:48",
    sender: "user",
    type: "video",
    time: "10:30 AM",
  },
];

export default function ChatScreen() {
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        item.sender === "user" ? styles.rightAlign : styles.leftAlign,
      ]}
    >
      {item.sender === "bot" && (
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.messageAvatar}
        />
      )}

      <View
        style={[
          styles.bubble,
          item.sender === "user" ? styles.userBubble : styles.botBubble,
        ]}
      >
        {item.type === "video" && (
          <Ionicons name="videocam" size={18} color="#fff" />
        )}

        {item.type === "call" && (
          <Ionicons name="call" size={18} color="#000" />
        )}

        <Text
          style={[
            styles.messageText,
            item.sender === "user" && { color: "#fff" },
          ]}
        >
          {item.text}
        </Text>
      </View>

      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#0B2D72" />

        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>Jasmine</Text>

        <View style={styles.headerIcons}>
          <Ionicons name="videocam" size={22} color="#0B2D72" />
          <Ionicons name="call" size={22} color="#0B2D72" />
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#0B2D72"
          />
        </View>
      </View>

      {/* CHAT */}

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* INPUT */}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.plusButton}>
          <Feather name="plus" size={20} color="#6C3CF0" />
        </TouchableOpacity>

        <TextInput placeholder="Enter message" style={styles.input} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },

  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },

  messageRow: {
    marginBottom: 12,
  },

  leftAlign: {
    alignItems: "flex-start",
  },

  rightAlign: {
    alignItems: "flex-end",
  },

  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 5,
  },

  bubble: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    maxWidth: "75%",
  },

  botBubble: {
    backgroundColor: "#E5E5E5",
  },

  userBubble: {
    backgroundColor: "#0B2D72",
  },

  messageText: {
    marginLeft: 6,
    fontSize: 14,
  },

  time: {
    fontSize: 10,
    color: "#888",
    marginTop: 3,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },

  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0B2D72",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
});
