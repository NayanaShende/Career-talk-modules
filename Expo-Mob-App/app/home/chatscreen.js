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
  Animated,
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

// ── Design Tokens ──────────────────────────────────────────────────────────
const PURPLE = "#7C5CBF";
const PURPLE_DARK = "#5B3FA0";
const PURPLE_LIGHT = "#EDE7F6";
const PURPLE_PALE = "#F3EEFF";
const BUBBLE_ME = "#7C5CBF";
const BUBBLE_THEM = "#FFFFFF";
const CHAT_BG = "#F5F0FF";
const TEXT_1 = "#1A1035";
const TEXT_2 = "#7B6F8E";
const BORDER = "#E8E0F5";
const WHITE = "#FFFFFF";
const GREEN_DOT = "#22C55E";
const GREY_DOT = "#9CA3AF";
const RED_END = "#EF4444";
const GOLD = "#F59E0B";

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

// ── Format seconds -> MM:SS ────────────────────────────────────────────────
const formatDuration = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

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
        )}&background=7C5CBF&color=fff`;

  // ── State ──────────────────────────────────────────────────────────────
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

  // ── Live timer: elapsed seconds (THE FIX) ──────────────────────────────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const preauthDone = useRef(false);
  const tickIntervalRef = useRef(null); // billing tick every 60s
  const secondTimerRef = useRef(null); // UI live timer every 1s
  const minutesRef = useRef(0);

  // ── Animated pulse for the red dot in billing bar ─────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (chatActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [chatActive]);

  // ── Load user ──────────────────────────────────────────────────────────
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

  // ── Find expert DB id ──────────────────────────────────────────────────
  const findExpertId = async () => {
    try {
      const expertRes = await API.get("/experts");
      const allExperts = expertRes?.data?.data || [];
      const expert = allExperts.find(
        (e) => Number(e.userId) === Number(RECEIVER_ID),
      );
      return expert ? expert.id : RECEIVER_ID;
    } catch {
      return RECEIVER_ID;
    }
  };

  // ── Start billing ──────────────────────────────────────────────────────
  const startChatBilling = async (userId) => {
    if (preauthDone.current) return;
    preauthDone.current = true;

    try {
      const eId = await findExpertId();
      setExpertDbId(eId);

      const res = await API.post("/wallet/chat-start", {
        userId,
        expertId: eId,
      });

      if (res?.data?.success) {
        setChatActive(true);
        setWalletBalance(res.data.balance);
        startTickTimer(userId, eId);
        startSecondTimer(); // start live UI timer
      }
    } catch (e) {
      const err = e?.response?.data;
      if (err?.error === "insufficient_balance") {
        Alert.alert(
          "Insufficient Balance",
          err.message ||
            `You need at least ₹50 to start chat.\nYour balance: ₹${err.balance?.toFixed(2) || 0}`,
          [
            { text: "Add Money", onPress: () => router.push("/(tabs)/wallet") },
            { text: "Cancel", style: "cancel", onPress: () => router.back() },
          ],
        );
      }
    }
  };

  // ── Billing tick: every 60 s ───────────────────────────────────────────
  const startTickTimer = (userId, eId) => {
    tickIntervalRef.current = setInterval(async () => {
      try {
        const res = await API.post("/wallet/chat-tick", {
          userId,
          expertId: eId,
        });
        if (res?.data?.success) {
          minutesRef.current += 1;
          setMinutesUsed(minutesRef.current);
          setWalletBalance(res.data.balance);
        }
      } catch (e) {
        if (e?.response?.data?.error === "insufficient_balance") {
          endChatBilling(userId, eId, true);
        }
      }
    }, 60000);
  };

  // ── UI live timer: every 1 s — THIS FIXES the timer not updating ───────
  const startSecondTimer = () => {
    setElapsedSeconds(0);
    secondTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  // ── End billing ────────────────────────────────────────────────────────
  const endChatBilling = async (userId, eId, autoEnded = false) => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (secondTimerRef.current) {
      clearInterval(secondTimerRef.current);
      secondTimerRef.current = null;
    }
    setChatActive(false);

    try {
      const res = await API.post("/wallet/chat-end", {
        userId,
        expertId: eId || expertDbId,
        minutesUsed: minutesRef.current,
      });

      if (res?.data?.success && autoEnded) {
        const { totalCharged, released, duration } = res.data;
        Alert.alert(
          "Chat Ended — Balance Empty",
          `Duration: ${duration} min\nTotal charged: ₹${totalCharged}\n₹${released} released back to wallet.`,
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } catch (e) {
      console.log("chatEnd error:", e.message);
    }
  };

  // ── Load messages ──────────────────────────────────────────────────────
  const loadChats = async () => {
    if (!RECEIVER_ID || !currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(
        `/chat/messages/${currentUserId}/${RECEIVER_ID}`,
      );
      setMessages(dedupeMessages(sortMessages(res?.data?.data || [])));
    } catch (error) {
      console.log("Load chat error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────
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

  // ── Socket + billing setup ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId || !RECEIVER_ID) return;
    loadChats();

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
          dedupeMessages(sortMessages([...prev, newMessage])),
        );
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
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (secondTimerRef.current) clearInterval(secondTimerRef.current);
    };
  }, [currentUserId, RECEIVER_ID, userRole]);

  // ── Render message ─────────────────────────────────────────────────────
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
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        {!isUser && (
          <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
        )}

        <View
          style={[styles.bubble, isUser ? styles.bubbleMe : styles.bubbleThem]}
        >
          <Text
            style={[
              styles.msgText,
              isUser ? styles.msgTextMe : styles.msgTextThem,
            ]}
          >
            {msgText}
          </Text>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                isUser ? styles.timeMine : styles.timeTheirs,
              ]}
            >
              {timeText}
            </Text>
            {isUser && (
              <Ionicons
                name="checkmark-done"
                size={13}
                color="rgba(255,255,255,0.55)"
                style={{ marginLeft: 3 }}
              />
            )}
          </View>
        </View>

        {!isUser && <View style={{ width: 52 }} />}
      </View>
    );
  };

  // ── Loading gate ───────────────────────────────────────────────────────
  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Setting up chat…</Text>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor={PURPLE_DARK} barStyle="light-content" />

      {/* ── BILLING BAR ─────────────────────────────────────────────── */}
      {chatActive && (
        <View style={styles.billingBar}>
          {/* Live MM:SS timer */}
          <View style={styles.billingTimerBox}>
            <Animated.View
              style={[styles.timerDot, { transform: [{ scale: pulseAnim }] }]}
            />
            <Text style={styles.billingTimerText}>
              {formatDuration(elapsedSeconds)}
            </Text>
          </View>

          {/* Rate badge */}
          <View style={styles.billingRateBox}>
            <Ionicons name="flash" size={11} color={GOLD} />
            <Text style={styles.billingRateText}>₹10/min</Text>
          </View>

          {/* Wallet balance */}
          <View style={styles.billingBalanceBox}>
            <Text style={styles.billingBalanceLabel}>Balance</Text>
            <Text style={styles.billingBalanceValue}>
              ₹{walletBalance.toFixed(2)}
            </Text>
          </View>

          {/* End button */}
          <TouchableOpacity
            style={styles.endChatBtn}
            onPress={() => {
              Alert.alert(
                "End Chat?",
                `Duration: ${minutesUsed} min\nCharged: ₹${minutesUsed * 10}\nRemaining hold will be released.`,
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
                ],
              );
            }}
          >
            <Text style={styles.endChatTxt}>End</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
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
                ],
              );
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_1} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerAvatarPressable}
          onPress={() => {
            if (userRole !== "expert") {
              router.push({ pathname: `/expert/${RECEIVER_ID}` });
            }
          }}
        >
          <View style={styles.headerAvatarWrap}>
            <Image
              source={{ uri: expertAvatarUrl }}
              style={styles.headerAvatar}
            />
            <View
              style={[
                styles.headerOnlineDot,
                { backgroundColor: isOnline ? GREEN_DOT : GREY_DOT },
              ]}
            />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {expertName}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? GREEN_DOT : GREY_DOT },
                ]}
              />
              <Text
                style={[
                  styles.headerStatus,
                  { color: isOnline ? "#16A34A" : TEXT_2 },
                ]}
              >
                {isOnline ? "Active now" : "Offline"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="videocam-outline" size={20} color={PURPLE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="call-outline" size={19} color={PURPLE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CHAT AREA ───────────────────────────────────────────────── */}
      <View style={styles.chatBg}>
        {loading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={styles.loadingText}>Loading messages…</Text>
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
                  <Ionicons
                    name="chatbubbles-outline"
                    size={36}
                    color={PURPLE}
                  />
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

      {/* ── INPUT BAR ───────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={22} color={PURPLE} />
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Type a message…"
              placeholderTextColor="#B0A8C8"
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

          <TouchableOpacity
            style={[
              styles.sendBtn,
              !textMessage.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!textMessage.trim()}
          >
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

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CHAT_BG },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CHAT_BG,
    gap: 12,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: TEXT_2, fontWeight: "500" },

  // ── Billing bar ──────────────────────────────────────────────────────
  billingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1035",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(124,92,191,0.3)",
  },
  billingTimerBox: { flexDirection: "row", alignItems: "center", gap: 7 },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED_END,
  },
  billingTimerText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  billingRateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  billingRateText: { color: GOLD, fontSize: 11, fontWeight: "700" },
  billingBalanceBox: { alignItems: "flex-end" },
  billingBalanceLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  billingBalanceValue: { color: "#4ADE80", fontSize: 14, fontWeight: "800" },
  endChatBtn: {
    backgroundColor: RED_END,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: RED_END,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  endChatTxt: { color: WHITE, fontWeight: "800", fontSize: 12 },

  // ── Header ───────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    elevation: 4,
    shadowColor: PURPLE,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PURPLE_PALE,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatarWrap: { position: "relative" },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: PURPLE_LIGHT,
  },
  headerOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: WHITE,
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  headerStatus: { fontSize: 12, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 6 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PURPLE_PALE,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Chat background ───────────────────────────────────────────────────
  chatBg: { flex: 1, backgroundColor: CHAT_BG },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingBottom: 10,
  },

  // ── Date separator ────────────────────────────────────────────────────
  dateSepWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 8,
  },
  dateSepLine: { flex: 1, height: 0.75, backgroundColor: "#D8D0F0" },
  dateSepPill: {
    backgroundColor: "#EDE7F6",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D4C9F0",
  },
  dateSepText: {
    fontSize: 11,
    color: PURPLE,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Message row ───────────────────────────────────────────────────────
  row: { flexDirection: "row", marginBottom: 8, alignItems: "flex-end" },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
    marginBottom: 2,
    borderWidth: 1.5,
    borderColor: PURPLE_LIGHT,
  },

  // ── Bubble ────────────────────────────────────────────────────────────
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
    shadowColor: PURPLE,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleThem: {
    backgroundColor: BUBBLE_THEM,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextMe: { color: WHITE },
  msgTextThem: { color: TEXT_1 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 2,
  },
  timeText: { fontSize: 10, fontWeight: "500" },
  timeMine: { color: "rgba(255,255,255,0.55)" },
  timeTheirs: { color: TEXT_2 },

  // ── Empty chat ────────────────────────────────────────────────────────
  emptyChat: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyChatTitle: { fontSize: 17, fontWeight: "800", color: TEXT_1 },
  emptyChatSub: { fontSize: 14, color: TEXT_2, textAlign: "center" },

  // ── Input bar ─────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PURPLE_PALE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: PURPLE_PALE,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 42,
    borderWidth: 1,
    borderColor: BORDER,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_1,
    fontWeight: "400",
    maxHeight: 100,
  },
  micBtn: { marginLeft: 6, marginBottom: 1 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
    shadowColor: PURPLE,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: "#C4B8E0",
    shadowOpacity: 0,
    elevation: 0,
  },
});
