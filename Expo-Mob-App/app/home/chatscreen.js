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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNotification } from "../../context/NotificationContext";

const { width } = Dimensions.get("window");
const BASE_URL = "https://career-talk-modules-backend.onrender.com";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#edddfc";
const TEAL_TEXT = "#867795";
const BUBBLE_ME = "#867795";
const BUBBLE_THEM = "#ffffff";
const CHAT_BG = "#f0f4f3";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#e5e7eb";

// ── Helpers ────────────────────────────────────────────────────────────────
const sortMessages = (msgs) =>
  [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const dedupeMessages = (msgs) => {
  const seen = new Set();
  return msgs.filter((m) => {
    if (String(m.id).startsWith("temp_")) return true;
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
};

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

// ─────────────────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const {
    expertId,
    name,
    avatar,
    expertName: paramExpertName,
    expertImage,
  } = useLocalSearchParams();

  const RECEIVER_ID = Number(expertId);
  const { clearUnread } = useNotification();

  const rawName = paramExpertName || name;
  const rawImage = expertImage || avatar;

  const expertName =
    rawName && rawName !== "undefined" && rawName !== "null"
      ? rawName
      : "Expert";

  const cleanImage = rawImage ? rawImage.replace(/^uploads\//, "") : null;
  const expertAvatarUrl =
    cleanImage &&
    cleanImage !== "undefined" &&
    cleanImage !== "null" &&
    cleanImage !== ""
      ? `${BASE_URL}/uploads/${cleanImage}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          expertName,
        )}&background=2d6a5e&color=fff`;

  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const [chatActive, setChatActive] = useState(false);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [expertDbId, setExpertDbId] = useState(null);

  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const preauthDone = useRef(false);
  const tickIntervalRef = useRef(null);
  const minutesRef = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        const role = (u?.role || u?.userType || "user").toLowerCase();
        setCurrentUserId(Number(uid));
        setUserRole(role);
      }
    });
  }, []);

  useEffect(() => {
    if (RECEIVER_ID) clearUnread(RECEIVER_ID);
  }, [RECEIVER_ID]);

  const findExpertId = async () => {
    try {
      const expertRes = await API.get("/experts");
      const allExperts = expertRes?.data?.data || [];
      const expert = allExperts.find(
        (e) => Number(e.userId) === Number(RECEIVER_ID)
      );
      const eId = expert ? expert.id : RECEIVER_ID;
      console.log("✅ Expert found — Expert.id:", eId);
      return eId;
    } catch (e) {
      console.log("findExpertId error:", e.message);
      return RECEIVER_ID;
    }
  };

  const startChatBilling = async (userId) => {
    if (preauthDone.current) return;
    preauthDone.current = true;

    try {
      const eId = await findExpertId();
      setExpertDbId(eId);

      const res = await API.post("/wallet/chat-start", {
        userId: userId,
        expertId: eId,
      });

      if (res?.data?.success) {
        setChatActive(true);
        setWalletBalance(res.data.balance);
        console.log("✅ Chat billing started. Balance:", res.data.balance);
        startTickTimer(userId, eId);
      }
    } catch (e) {
      const err = e?.response?.data;
      if (err?.error === "insufficient_balance") {
        Alert.alert(
          "Insufficient Balance",
          err.message ||
            `You need at least ₹50 to start chat.\nYour balance: ₹${
              err.balance?.toFixed(2) || 0
            }`,
          [
            { text: "Add Money", onPress: () => router.push("/(tabs)/wallet") },
            { text: "Cancel", style: "cancel", onPress: () => router.back() },
          ]
        );
      } else {
        console.log("chatStart error:", e.message);
      }
    }
  };

  const startTickTimer = (userId, eId) => {
    tickIntervalRef.current = setInterval(async () => {
      try {
        const res = await API.post("/wallet/chat-tick", {
          userId: userId,
          expertId: eId,
        });

        if (res?.data?.success) {
          minutesRef.current += 1;
          setMinutesUsed(minutesRef.current);
          setWalletBalance(res.data.balance);
          console.log(
            "⏱️ Minute",
            minutesRef.current,
            "— Balance:",
            res.data.balance
          );
        }
      } catch (e) {
        const err = e?.response?.data;
        if (err?.error === "insufficient_balance") {
          endChatBilling(userId, eId, true);
        }
        console.log("chatTick error:", e?.message);
      }
    }, 60000);
  };

  const endChatBilling = async (userId, eId, autoEnded = false) => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }

    setChatActive(false);

    try {
      const res = await API.post("/wallet/chat-end", {
        userId: userId,
        expertId: eId || expertDbId,
        minutesUsed: minutesRef.current,
      });

      if (res?.data?.success) {
        const { totalCharged, released, duration } = res.data;
        console.log(
          "✅ Chat ended — charged: ₹" +
            totalCharged +
            ", released: ₹" +
            released
        );

        if (autoEnded) {
          Alert.alert(
            "Chat Ended — Balance Empty",
            `Duration: ${duration} min\nTotal charged: ₹${totalCharged}\n₹${released} released back to wallet.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      }
    } catch (e) {
      console.log("chatEnd error:", e.message);
    }
  };

  const loadChats = async () => {
    if (!RECEIVER_ID || !currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(
        `/chat/messages/${currentUserId}/${RECEIVER_ID}`
      );
      setMessages(dedupeMessages(sortMessages(res?.data?.data || [])));
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
      ])
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
    // Only start billing for users — experts earn, they don't pay
    if (userRole !== "expert") {
      startChatBilling(currentUserId);
    }

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
        setMessages((prev) =>
          dedupeMessages(sortMessages([...prev, newMessage]))
        );
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });
    return () => {
      socketRef.current.off("receiveMessage");
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.disconnect();
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [currentUserId, RECEIVER_ID, userRole]);

  // ── Render item ───────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateSepWrap}>
          <View style={styles.dateSepLine} />
          <View style={styles.dateSepPill}>
            <Text style={styles.dateSepText}>{String(item.label || "")}</Text>
          </View>
          <View style={styles.dateSepLine} />
        </View>
      );
    }

    const isUser = Number(item.sender_id) === Number(currentUserId);
    const msgText = item.message != null ? String(item.message) : "";
    const timeText = formatTime(item.created_at);

    return (
      // FIX: restored proper JSX structure — removed orphaned style lines,
      // added opening <Text>, fixed <View> closing tag for metaRow, added
      // <Text> for timeText inside metaRow
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        {/* Expert avatar on the left */}
        {!isUser && (
          <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleMe : styles.bubbleThem,
          ]}>
          <Text
            style={[
              styles.msgText,
              isUser ? styles.msgTextMe : styles.msgTextThem,
            ]}>
            {msgText}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                isUser ? styles.timeMine : styles.timeTheirs,
              ]}>
              {timeText}
            </Text>
            {isUser && (
              <Ionicons
                name="checkmark-done"
                size={13}
                color="rgba(255,255,255,0.6)"
                style={{ marginLeft: 3 }}
              />
            )}
          </View>
        </View>

        {/* Spacer so expert bubbles don't stretch full width */}
        {!isUser && <View style={{ width: 52 }} />}
      </View>
    );
  };

  // ── Loading gate ──────────────────────────────────────────────────────────
  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor={TEAL} barStyle="light-content" />

      {/* ── BILLING BAR ────────────────────────────────────────────────── */}
      {chatActive && (
        <View style={styles.billingBar}>
          <View style={styles.billingLeft}>
            <Text style={styles.billingTimer}>⏱️ {minutesUsed} min</Text>
            <Text style={styles.billingRate}>₹10/min</Text>
          </View>
          <Text style={styles.billingBalance}>
            ₹{walletBalance.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.endChatBtn}
            onPress={() => {
              Alert.alert(
                "End Chat?",
                `Duration: ${minutesUsed} min\nCharged: ₹${
                  minutesUsed * 10
                }\nRemaining hold will be released.`,
                [
                  {
                    text: "End Chat",
                    style: "destructive",
                    onPress: () => {
                      endChatBilling(currentUserId, expertDbId);
                      router.back();
                    },
                  },
                  { text: "Continue", style: "cancel" },
                ]
              );
            }}>
            <Text style={styles.endChatTxt}>End</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* FIX: restored TouchableOpacity with correct onPress and children */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (chatActive) {
              Alert.alert(
                "End Chat?",
                `Duration: ${minutesUsed} min\nCharged: ₹${minutesUsed * 10}`,
                [
                  {
                    text: "End & Leave",
                    style: "destructive",
                    onPress: () => {
                      endChatBilling(currentUserId, expertDbId);
                      router.back();
                    },
                  },
                  { text: "Stay", style: "cancel" },
                ]
              );
            } else {
              router.back();
            }
          }}>
          <Ionicons name="chevron-back" size={22} color={TEXT_1} />
        </TouchableOpacity>

        {/* FIX: restored TouchableOpacity wrapping avatar + info with correct
            onPress, removed orphaned code fragments */}
        <TouchableOpacity
          style={styles.headerAvatarPressable}
          onPress={() => {
            if (userRole === "expert") {
              // Expert clicking → show user's profile or do nothing
            } else {
              // User clicking → show expert's profile
              router.push({
                pathname: `/expert/${RECEIVER_ID}`,
              });
            }
          }}>
          {/* Avatar + online dot */}
          <View style={styles.headerAvatarWrap}>
            <Image
              source={{ uri: expertAvatarUrl }}
              style={styles.headerAvatar}
            />
            <View
              style={[
                styles.headerOnlineDot,
                { backgroundColor: isOnline ? "#22C55E" : "#9CA3AF" },
              ]}
            />
          </View>

          {/* Name + status */}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {expertName}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? "#22C55E" : "#9CA3AF" },
                ]}
              />
              <Text
                style={[
                  styles.headerStatus,
                  { color: isOnline ? "#16a34a" : TEXT_2 },
                ]}>
                {isOnline ? "Active now" : "Offline"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action icons */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="videocam-outline" size={20} color={TEXT_1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="call-outline" size={19} color={TEXT_1} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CHAT AREA ──────────────────────────────────────────────────── */}
      <View style={styles.chatBg}>
        {loading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={TEAL} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={groupByDate(messages)}
            renderItem={renderItem}
            keyExtractor={(item, index) => `msg_${item.id}_${index}`}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <View style={styles.emptyChatIcon}>
                  <Ionicons name="chatbubbles-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.emptyChatTitle}>
                  Start the conversation
                </Text>
                <Text style={styles.emptyChatSub}>
                  Send a message to {expertName}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* ── INPUT BAR ──────────────────────────────────────────────────── */}
      {/* FIX: wrapped input bar in KeyboardAvoidingView correctly */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputBar}>
          {/* Attachment */}
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={22} color={TEAL} />
          </TouchableOpacity>

          {/* Text input */}
          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#AAAAAA"
              style={styles.input}
              value={textMessage}
              onChangeText={setTextMessage}
              multiline
            />
            {!textMessage.trim() && (
              <TouchableOpacity style={styles.micBtn}>
                <Ionicons name="mic-outline" size={20} color={TEXT_2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Send */}
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !textMessage.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!textMessage.trim()}>
            <Ionicons
              name="send"
              size={17}
              color="#fff"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHAT_BG,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CHAT_BG,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_2,
    fontWeight: "500",
  },

  // ── Billing bar ──
  // FIX: restored billingBar as a proper style object (was orphaned/cut off)
  billingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1f2937",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  billingLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  billingTimer: { color: "#fff", fontSize: 13, fontWeight: "700" },
  billingRate: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  billingBalance: { color: "#4ADE80", fontSize: 15, fontWeight: "800" },
  endChatBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  endChatTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 10,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f5f7",
    justifyContent: "center",
    alignItems: "center",
  },
  // FIX: added headerAvatarPressable (wraps avatar + info as a tappable area)
  headerAvatarPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatarWrap: {
    position: "relative",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
  },
  headerOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT_1,
    letterSpacing: -0.2,
    paddingTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f5f7",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Chat background ──
  chatBg: {
    flex: 1,
    backgroundColor: CHAT_BG,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingBottom: 10,
  },

  // ── Date separator ──
  dateSepWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 8,
  },
  dateSepLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#d1d5db",
  },
  dateSepPill: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    borderRadius: 20,
  },
  dateSepText: {
    fontSize: 12,
    color: TEXT_2,
    fontWeight: "600",
  },

  // ── Message row ──
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
    marginBottom: 2,
  },
  // FIX: restored msgAvatarLarge (was orphaned fragment with no key)
  msgAvatarLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: TEAL_LIGHT,
  },

  // ── Bubble ──
  bubble: {
    maxWidth: width * 0.68,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 7,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: BUBBLE_ME,
    borderBottomRightRadius: 4,
    elevation: 1,
    shadowColor: TEAL,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // FIX: restored bubbleThem closing brace (was missing)
  bubbleThem: {
    backgroundColor: BUBBLE_THEM,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgTextMe: {
    color: "#ffffff",
  },
  msgTextThem: {
    color: TEXT_1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 2,
  },
  timeText: { fontSize: 10, fontWeight: "500" },
  timeMine: { color: "rgba(255,255,255,0.6)" },
  timeTheirs: { color: TEXT_2 },

  // ── Empty chat ──
  emptyChat: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyChatTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
  },
  emptyChatSub: {
    fontSize: 14,
    color: TEXT_2,
    textAlign: "center",
  },

  // ── Input bar ──
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f4f5f7",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 42,
  },
  // FIX: restored input style (orphaned color/fontWeight lines merged in)
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_1,
    fontWeight: "400",
    maxHeight: 100,
  },
  micBtn: {
    marginLeft: 6,
    marginBottom: 1,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendBtnDisabled: {
    backgroundColor: TEAL,
  },
});