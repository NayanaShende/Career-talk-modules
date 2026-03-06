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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const BASE_URL = "http://10.89.141.9:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

// ── helpers ──────────────────────────────────────────────
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

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// ─────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { expertId, name, avatar } = useLocalSearchParams();
  const RECEIVER_ID = Number(expertId);

  // ── unchanged logic from previous version ────────────
  const expertName =
    name && name !== "undefined" && name !== "null" ? name : "Expert";

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
    } catch {
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

  // ── render ────────────────────────────────────────────
  const renderItem = ({ item }) => {
    // Date separator
    if (item.type === "date") {
      return (
        <View style={styles.dateSepWrap}>
          <Text style={styles.dateSepText}>{item.label}</Text>
        </View>
      );
    }

    const isUser = Number(item.sender_id) === Number(currentUserId);

    return (
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        {/* Receiver avatar */}
        {!isUser && (
          <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
        )}

        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              styles.msgText,
              isUser ? styles.msgTextMine : styles.msgTextTheirs,
            ]}
          >
            {item.message}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                isUser ? styles.timeMine : styles.timeTheirs,
              ]}
            >
              {formatTime(item.created_at)}
            </Text>
            {isUser && <Text style={styles.ticks}> ✓✓</Text>}
          </View>
        </View>

        {/* Spacer so receiver bubbles don't stretch full width */}
        {!isUser && <View style={{ width: 48 }} />}
      </View>
    );
  };

  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4A6CF7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* ── HEADER (iMessage / reference UI style) ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={{ uri: expertAvatarUrl }}
            style={styles.headerAvatar}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {expertName}
          </Text>
          <Text
            style={[
              styles.headerStatus,
              { color: isOnline ? "#34C759" : "#8E8E93" },
            ]}
          >
            {isOnline ? "Active now" : "Offline"}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MESSAGES ── */}
      <View style={styles.chatBg}>
        {loading && messages.length === 0 ? (
          <ActivityIndicator
            style={{ marginTop: 40 }}
            color="#4A6CF7"
            size="large"
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={groupByDate(messages)}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* ── INPUT BAR ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusBtn}>
            <Text style={styles.plusText}>＋</Text>
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#C7C7CC"
              style={styles.input}
              value={textMessage}
              onChangeText={setTextMessage}
              multiline
            />
            {/* mic icon when empty */}
            {!textMessage.trim() && (
              <TouchableOpacity style={styles.micBtn}>
                <Text style={styles.micText}>🎤</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* send button */}
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !textMessage.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!textMessage.trim()}
          >
            <Text style={styles.sendArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── STYLES ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  backBtn: { paddingRight: 4 },
  backArrow: {
    fontSize: 34,
    color: "#4A6CF7",
    lineHeight: 38,
    fontWeight: "300",
  },

  headerCenter: { position: "relative", marginRight: 10 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21 },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#fff",
  },

  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "600", color: "#000" },
  headerStatus: { fontSize: 12, marginTop: 1 },

  headerActions: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16 },

  // Chat background
  chatBg: { flex: 1, backgroundColor: "#F2F2F7" },
  listContent: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 8 },

  // Date separator
  dateSepWrap: { alignItems: "center", marginVertical: 14 },
  dateSepText: {
    fontSize: 12,
    color: "#8E8E93",
    backgroundColor: "transparent",
    fontWeight: "500",
  },

  // Message rows
  row: { flexDirection: "row", marginBottom: 6, alignItems: "flex-end" },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },

  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
    marginBottom: 2,
  },

  // Bubbles — iMessage style
  bubble: {
    maxWidth: width * 0.68,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: "#4A6CF7", // blue for sender
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: "#FFFFFF", // white for receiver
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextMine: { color: "#FFFFFF" },
  msgTextTheirs: { color: "#1C1C1E" },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 3,
  },
  timeText: { fontSize: 10 },
  timeMine: { color: "rgba(255,255,255,0.65)" },
  timeTheirs: { color: "#8E8E93" },
  ticks: { fontSize: 10, color: "rgba(255,255,255,0.65)" },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
    gap: 8,
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  plusText: { fontSize: 20, color: "#4A6CF7", lineHeight: 24 },

  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F2F2F7",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  micBtn: { marginLeft: 6, marginBottom: 1 },
  micText: { fontSize: 16 },

  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A6CF7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnDisabled: { backgroundColor: "#C7C7CC" },
  sendArrow: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    lineHeight: 28,
    marginLeft: 3,
  },
});
