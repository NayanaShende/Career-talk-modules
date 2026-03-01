import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { io } from "socket.io-client";

// 🔥 CONNECT SOCKET (use same IP as backend)
const socket = io("http://10.89.141.9:3000");

const API = axios.create({
  baseURL: "http://10.89.141.9:3000/api",
  timeout: 10000,
});

export default function ChatScreen(props) {
  // Web support
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const expertIdFromURL = searchParams?.get("expertId");
  const expertNameFromURL = searchParams?.get("name");

  // Mobile support
  const expertIdFromRoute = props?.route?.params?.expertId;
  const expertNameFromRoute = props?.route?.params?.expertName;

  const RECEIVER_ID = Number(expertIdFromRoute || expertIdFromURL);
  const expertName =
    expertNameFromRoute || expertNameFromURL || "Expert";

  // ⚠ Replace with real logged-in user id
  const CURRENT_USER_ID = 1;

  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const flatListRef = useRef(null);

  // ✅ Load chats from DB
  const loadChats = async () => {
    if (!RECEIVER_ID) return;

    try {
      setLoading(true);

      const res = await API.get(
        `/chat/${CURRENT_USER_ID}/${RECEIVER_ID}`
      );

      setMessages(res?.data?.data || []);
    } catch (error) {
      console.log("Load chat error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send message
  const handleSend = async () => {
    if (!textMessage.trim() || !RECEIVER_ID) return;

    const messageToSend = textMessage;
    setTextMessage("");

    try {
      await API.post("/chat/send", {
        senderId: CURRENT_USER_ID,
        receiverId: RECEIVER_ID,
        message: messageToSend,
      });
    } catch (error) {
      console.log("Send error:", error.message);
    }
  };

  // ✅ SOCKET + LOAD
  useEffect(() => {
    if (!RECEIVER_ID) return;

    // 1️⃣ Load old messages
    loadChats();

    // 2️⃣ Join personal room
    socket.emit("join", CURRENT_USER_ID);
    console.log("✅ Joined socket room:", CURRENT_USER_ID);

    // 3️⃣ Listen for new messages
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // 4️⃣ Listen for online
    socket.on("user_online", (userId) => {
      if (Number(userId) === Number(RECEIVER_ID)) {
        setIsOnline(true);
      }
    });

    // 5️⃣ Listen for offline
    socket.on("user_offline", (userId) => {
      if (Number(userId) === Number(RECEIVER_ID)) {
        setIsOnline(false);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [RECEIVER_ID]);

  const renderItem = ({ item }) => {
    const isUser =
      Number(item.senderId) === Number(CURRENT_USER_ID);

    return (
      <View
        style={[
          styles.messageContainer,
          { alignItems: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? "#DCF8C6" : "#5B7FFF",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 14,
              color: isUser ? "#000" : "#fff",
            }}
          >
            {item.message}
          </Text>
        </View>

        <Text style={styles.time}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{expertName}</Text>
            <Text
              style={[
                styles.status,
                { color: isOnline ? "green" : "gray" },
              ]}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {loading && messages.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            contentContainerStyle={{ padding: 15 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Write your Message...."
            style={styles.input}
            value={textMessage}
            onChangeText={setTextMessage}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Text style={{ fontSize: 18 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },

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

  name: { fontSize: 16, fontWeight: "600" },

  status: { fontSize: 12 },

  messageContainer: { marginBottom: 10 },

  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
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