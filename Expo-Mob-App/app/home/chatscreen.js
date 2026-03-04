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

const messages = [
  {
    id: "1",
    text: "👋 Hi! I'm aiii, your personal screen time companion.\n\nLet's take a closer look at your phone habits and triggers together. I'll ask you some questions to help you understand yourself better and take the next step towards healthier usage.",
    sender: "bot",
    time: "Oct 17, 18:00",
  },
  {
    id: "2",
    text: "When was the last time you felt unhappy with your phone usage?",
    sender: "bot",
    time: "Oct 17, 18:00",
  },
  {
    id: "3",
    text: "This morning",
    sender: "user",
    time: "Oct 17, 18:00",
  },
  {
    id: "4",
    text: "What do you think made you feel unhappy about your phone use today?",
    sender: "bot",
    time: "Oct 17, 18:00",
  },
  {
    id: "5",
    text: "I feel it's because I know I have a lot to do",
    sender: "user",
    time: "Oct 17, 18:00",
  },
];

export default function App() {
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userAlign : styles.botAlign,
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.sender === "user" ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/100",
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>aiii</Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>

      <Text style={styles.today}>Today</Text>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput placeholder="Write your thoughts..." style={styles.input} />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={{ fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  status: {
    fontSize: 12,
    color: "green",
  },

  today: {
    textAlign: "center",
    marginTop: 10,
    color: "#888",
  },

  messageContainer: {
    marginBottom: 10,
  },

  botAlign: {
    alignItems: "flex-start",
  },

  userAlign: {
    alignItems: "flex-end",
  },

  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },

  botBubble: {
    backgroundColor: "#5B7FFF",
  },

  userBubble: {
    backgroundColor: "#E5E7EB",
  },

  messageText: {
    color: "#000",
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

  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#e5e7eb",
    width: 45,
    height: 45,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
