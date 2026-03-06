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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://10.89.141.9:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

const sortMessages = (msgs) =>
  [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const groupByDate = (msgs) => {
  const groups = [];
  let lastDate = null;
  msgs.forEach((msg) => {
    const msgDate = msg.created_at
      ? new Date(msg.created_at).toDateString()
      : null;
    if (msgDate && msgDate !== lastDate) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const label =
        msgDate === today
          ? "Today"
          : msgDate === yesterday
            ? "Yesterday"
            : msgDate;
      groups.push({ id: `date_${msgDate}`, type: "date", label });
      lastDate = msgDate;
    }
    groups.push({ ...msg, type: "message" });
  });
  return groups;
};

export default function ChatScreen() {
  const { expertId, name, avatar } = useLocalSearchParams();
  const RECEIVER_ID = Number(expertId);

  // ✅ Use expert name — never show phone number
  const expertName =
    name && name !== "undefined" && name !== "null" ? name : "Expert";

  // ✅ Build avatar URL correctly
  const expertAvatarUrl =
    avatar && avatar !== "undefined" && avatar !== "null" && avatar !== ""
      ? `${BASE_URL}/uploads/${avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(expertName)}&background=0B2D72&color=fff`;

  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  // ✅ Load real userId from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        setCurrentUserId(Number(uid));
      }
    });
  }, []);

  const loadChats = async () => {
    if (!RECEIVER_ID || !currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(
        `/chat/messages/${currentUserId}/${RECEIVER_ID}`,
      );
      setMessages(sortMessages(res?.data?.data || []));
    } catch (error) {
      console.log("Load chat error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!textMessage.trim() || !RECEIVER_ID || !currentUserId) return;
    const messageToSend = textMessage;
    setTextMessage("");
    const tempId = `temp_${Date.now()}`;

    setMessages((prev) =>
      sortMessages([
        ...prev,
        {
          id: tempId,
          sender_id: currentUserId,
          receiver_id: RECEIVER_ID,
          message: messageToSend,
          created_at: new Date(),
        },
      ]),
    );
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);

    try {
      await API.post("/chat/send", {
        sender_id: currentUserId,
        receiver_id: RECEIVER_ID,
        message: messageToSend,
      });
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  useEffect(() => {
    if (!currentUserId || !RECEIVER_ID) return;
    loadChats();

    socketRef.current = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      setIsOnline(true);
      socketRef.current.emit("joinRoom", { userId: currentUserId });
    });

    socketRef.current.on("disconnect", () => setIsOnline(false));

    socketRef.current.on("receiveMessage", (newMessage) => {
      if (Number(newMessage.sender_id) !== Number(currentUserId)) {
        setMessages((prev) => sortMessages([...prev, newMessage]));
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    });

    return () => {
      socketRef.current.off("receiveMessage");
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.disconnect();
    };
  }, [currentUserId, RECEIVER_ID]);

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparatorWrap}>
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{item.label}</Text>
          </View>
        </View>
      );
    }

    const isUser = Number(item.sender_id) === Number(currentUserId);

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        {/* ✅ Show expert avatar ONCE on left - same for all received messages */}
        {!isUser && (
          <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleExpert,
          ]}
        >
          <Text style={styles.bubbleText}>{item.message}</Text>
          <Text
            style={[
              styles.bubbleTime,
              isUser ? styles.bubbleTimeUser : styles.bubbleTimeExpert,
            ]}
          >
            {formatTime(item.created_at)}
            {isUser && <Text style={styles.tick}> ✓✓</Text>}
          </Text>
        </View>

        {!isUser && <View style={{ width: 40 }} />}
      </View>
    );
  };

  if (!currentUserId) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ECE5DD",
        }}
      >
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />

      {/* ✅ HEADER - shows real expert name + avatar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Image source={{ uri: expertAvatarUrl }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{expertName}</Text>
          <Text style={styles.headerStatus}>
            {isOnline ? "online" : "offline"}
          </Text>
        </View>
      </View>

      {/* CHAT AREA */}
      <View style={styles.chatBg}>
        {loading && messages.length === 0 ? (
          <ActivityIndicator
            style={{ marginTop: 30 }}
            color="#075E54"
            size="large"
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={groupByDate(messages)}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 10, paddingBottom: 16 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Type a message"
              placeholderTextColor="#999"
              style={styles.input}
              value={textMessage}
              onChangeText={setTextMessage}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !textMessage.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!textMessage.trim()}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#075E54" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075E54",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  backBtn: { paddingRight: 6 },
  backArrow: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerStatus: { fontSize: 12, color: "#c8e6c9", marginTop: 1 },
  chatBg: { flex: 1, backgroundColor: "#ECE5DD" },
  dateSeparatorWrap: { alignItems: "center", marginVertical: 10 },
  dateSeparator: {
    backgroundColor: "#DCF8C6",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dateSeparatorText: { fontSize: 12, color: "#555", fontWeight: "500" },
  messageRow: { flexDirection: "row", marginBottom: 4, alignItems: "flex-end" },
  messageRowRight: { justifyContent: "flex-end" },
  messageRowLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "72%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 8,
    elevation: 1,
  },
  bubbleUser: { backgroundColor: "#DCF8C6", borderTopRightRadius: 0 },
  bubbleExpert: { backgroundColor: "#ffffff", borderTopLeftRadius: 0 },
  bubbleText: { fontSize: 15, lineHeight: 20, color: "#111" },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  bubbleTimeUser: { color: "#7a9e7a" },
  bubbleTimeExpert: { color: "#aaa" },
  tick: { color: "#53bdeb", fontSize: 10 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
    elevation: 1,
  },
  input: { fontSize: 15, color: "#111", maxHeight: 100 },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#075E54",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  sendBtnDisabled: { backgroundColor: "#aaa" },
  sendBtnText: { fontSize: 18, color: "#fff" },
});
