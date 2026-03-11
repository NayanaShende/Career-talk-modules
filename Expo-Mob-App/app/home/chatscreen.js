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
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const BASE_URL = "http://192.168.1.15:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { expertId, name, avatar } = useLocalSearchParams();
  const RECEIVER_ID = Number(expertId);

  const expertName =
    name && name !== "undefined" && name !== "null" ? name : "Expert";
  const expertAvatarUrl =
    avatar && avatar !== "undefined" && avatar !== "null" && avatar !== ""
      ? `${BASE_URL}/uploads/${avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(expertName)}&background=075E54&color=fff`;

  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [freeChatEnded, setFreeChatEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // countdown seconds

  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const typingTimer = useRef(null);

  // ── Load user ──
  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        setCurrentUserId(Number(uid));
      }
    });
  }, []);

  // ── Free chat countdown timer ──
  useEffect(() => {
    // Countdown display
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // End free chat after 60s
    timerRef.current = setTimeout(() => {
      setFreeChatEnded(true);
      Alert.alert(
        "⏰ Free Chat Ended",
        "Your free 1-minute chat is over. Recharge your wallet to continue chatting.",
        [
          {
            text: "Go to Wallet",
            onPress: () => router.push("/home/WalletModal"),
          },
        ],
      );
    }, 60000);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  // ── Load chat history ──
  const loadChats = async () => {
    if (!RECEIVER_ID || !currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(
        `/chat/messages/${currentUserId}/${RECEIVER_ID}`,
      );
      setMessages(sortMessages(res?.data?.data || []));
    } catch (err) {
      console.log("Load chat error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Socket setup ──
  useEffect(() => {
    if (!currentUserId || !RECEIVER_ID) return;

    loadChats();

    socketRef.current = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      setIsOnline(true);
      socketRef.current.emit("joinRoom", { userId: currentUserId });
    });

    socketRef.current.on("disconnect", () => setIsOnline(false));

    socketRef.current.on("receiveMessage", (msg) => {
      if (Number(msg.sender_id) !== Number(currentUserId)) {
        setMessages((prev) => sortMessages([...prev, msg]));
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    });

    socketRef.current.on("typing", ({ senderId }) => {
      if (Number(senderId) === RECEIVER_ID) {
        setIsTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => socketRef.current?.disconnect();
  }, [currentUserId, RECEIVER_ID]);

  // ── Send message ──
  const handleSend = async () => {
    if (freeChatEnded) {
      Alert.alert(
        "Recharge Required",
        "Your free chat has ended. Please recharge wallet to continue.",
        [
          {
            text: "Go to Wallet",
            onPress: () => router.push("/home/WalletModal"),
          },
        ],
      );
      return;
    }

    if (!textMessage.trim() || !RECEIVER_ID || !currentUserId) return;

    const msg = textMessage.trim();
    const tempId = `temp_${Date.now()}`;
    setTextMessage("");

    setMessages((prev) =>
      sortMessages([
        ...prev,
        {
          id: tempId,
          sender_id: currentUserId,
          receiver_id: RECEIVER_ID,
          message: msg,
          created_at: new Date(),
        },
      ]),
    );

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);

    try {
      await API.post("/chat/send", {
        sender_id: currentUserId,
        receiver_id: RECEIVER_ID,
        message: msg,
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleTextChange = (text) => {
    setTextMessage(text);
    socketRef.current?.emit("typing", {
      senderId: currentUserId,
      receiverId: RECEIVER_ID,
    });
  };

  // ── Call handlers ──
  const handleVoiceCall = () => {
    Alert.alert("📞 Voice Call", `Calling ${expertName}...`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Initiating voice call") },
    ]);
  };

  const handleVideoCall = () => {
    Alert.alert("📹 Video Call", `Video calling ${expertName}...`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Initiating video call") },
    ]);
  };

  // ── Render message ──
  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const isUser = Number(item.sender_id) === Number(currentUserId);

    return (
      <View
        style={[styles.msgRow, isUser ? styles.msgRowRight : styles.msgRowLeft]}
      >
        {/* Expert avatar on left */}
        {!isUser && (
          <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.bubbleTextMine : styles.bubbleTextTheirs,
            ]}
          >
            {item.message}
          </Text>
          <View style={styles.bubbleMeta}>
            <Text
              style={[
                styles.bubbleTime,
                isUser ? styles.bubbleTimeMine : styles.bubbleTimeTheirs,
              ]}
            >
              {formatTime(item.created_at)}
            </Text>
            {isUser && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color="rgba(255,255,255,0.8)"
                style={{ marginLeft: 3 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  // Timer color: green > yellow > red
  const timerColor =
    timeLeft > 30 ? "#25D366" : timeLeft > 10 ? "#FFC107" : "#FF3B30";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />

      {/* ── WhatsApp-style Header ── */}
      <View style={styles.header}>
        {/* Back + Avatar + Info */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Pressable
          style={styles.headerCenter}
          onPress={() => {
            /* open contact info */
          }}
        >
          <Image
            source={{ uri: expertAvatarUrl }}
            style={styles.headerAvatar}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              {expertName}
            </Text>
            <Text style={styles.headerStatus}>
              {isTyping ? "typing..." : isOnline ? "online" : "offline"}
            </Text>
          </View>
        </Pressable>

        {/* ── Call buttons ── */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleVideoCall}
            style={styles.headerIcon}
            hitSlop={8}
          >
            <Feather name="video" size={21} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleVoiceCall}
            style={styles.headerIcon}
            hitSlop={8}
          >
            <Feather name="phone" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} hitSlop={8}>
            <Feather name="more-vertical" size={21} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Free chat timer banner ── */}
      {!freeChatEnded && (
        <View style={[styles.timerBanner, { borderLeftColor: timerColor }]}>
          <Ionicons name="timer-outline" size={16} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>
            Free chat: {timeLeft}s remaining
          </Text>
        </View>
      )}

      {freeChatEnded && (
        <View style={styles.endedBanner}>
          <Ionicons name="lock-closed" size={14} color="#fff" />
          <Text style={styles.endedText}>
            Free chat ended · Recharge to continue
          </Text>
          <TouchableOpacity onPress={() => router.push("/home/WalletModal")}>
            <Text style={styles.endedLink}>Recharge</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Chat background + messages ── */}
      <View style={styles.chatBg}>
        {loading ? (
          <View style={styles.loadingScreen}>
            <ActivityIndicator size="small" color="#075E54" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={groupByDate(messages)}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={48}
                  color="#ccc"
                />
                <Text style={styles.emptyChatText}>No messages yet</Text>
                <Text style={styles.emptyChatSub}>
                  Say hello to {expertName}!
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* ── Input bar ── */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
        <View style={styles.inputBar}>
          {/* Emoji / attach */}
          <TouchableOpacity style={styles.inputIcon}>
            <Ionicons name="happy-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TextInput
            placeholder="Message"
            placeholderTextColor="#8E8E93"
            style={styles.input}
            value={textMessage}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />

          {/* Attachment */}
          <TouchableOpacity style={styles.inputIcon}>
            <Ionicons name="attach" size={24} color="#8E8E93" />
          </TouchableOpacity>

          {/* Send / mic button */}
          {textMessage.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="mic" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECE5DD" },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECE5DD",
  },

  // ── Header (WhatsApp green) ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075E54",
    paddingHorizontal: 8,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backBtn: { padding: 6, marginRight: 2 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerStatus: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerIcon: { padding: 8, marginLeft: 2 },

  // ── Timers ──
  timerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderLeftWidth: 4,
    borderLeftColor: "#25D366",
  },
  timerText: { fontSize: 13, fontWeight: "600" },
  endedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  endedText: { fontSize: 12, color: "#fff", flex: 1 },
  endedLink: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // ── Chat area ──
  chatBg: { flex: 1, backgroundColor: "#ECE5DD" },
  listContent: { paddingHorizontal: 8, paddingVertical: 12 },

  // Empty state
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyChatText: {
    fontSize: 16,
    color: "#aaa",
    fontWeight: "600",
    marginTop: 12,
  },
  emptyChatSub: { fontSize: 13, color: "#bbb", marginTop: 4 },

  // ── Date separator ──
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  dateLine: { flex: 1, height: 0.5, backgroundColor: "#B0B0B0" },
  dateLabel: {
    fontSize: 11,
    color: "#6B6B6B",
    backgroundColor: "#D1F0DC",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 10,
    overflow: "hidden",
  },

  // ── Message rows ──
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 2 },
  msgRowRight: { justifyContent: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 4,
  },

  // ── Bubbles ──
  bubble: {
    maxWidth: width * 0.72,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 7,
    paddingBottom: 5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  bubbleMine: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 2,
    marginLeft: 50,
    marginRight: 4,
  },
  bubbleTheirs: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 2,
    marginRight: 50,
    marginLeft: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: "#1A1A1A" },
  bubbleTextTheirs: { color: "#1A1A1A" },
  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 3,
  },
  bubbleTime: { fontSize: 10 },
  bubbleTimeMine: { color: "#7B9E87" },
  bubbleTimeTheirs: { color: "#999" },

  // ── Input bar ──
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    gap: 6,
  },
  inputIcon: { padding: 4, paddingBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#1A1A1A",
    maxHeight: 100,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
});
