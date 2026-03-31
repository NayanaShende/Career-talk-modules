import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNotification } from "../../context/NotificationContext";

const { width } = Dimensions.get("window");
const BASE_URL = "http://10.235.241.9:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

const TEAL = "#867795";
const TEAL_LIGHT = "#edddfc";
const TEAL_TEXT = "#867795";
const BUBBLE_ME = "#867795";
const BUBBLE_THEM = "#ffffff";
const CHAT_BG = "#f0f4f3";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#e5e7eb";
const WHITE = "#FFFFFF";
const SELECT_BG = "rgba(134,119,149,0.18)";

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

const getImageUri = (image, name) => {
  if (
    image &&
    image !== "undefined" &&
    image !== "null" &&
    image.trim() !== ""
  ) {
    if (image.startsWith("http://") || image.startsWith("https://"))
      return image;
    return `${BASE_URL}/uploads/${image.replace(/^uploads\//, "")}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Expert")}&background=0B2D72&color=fff`;
};

const extractUserName = (u) => {
  if (!u) return "User";
  return (
    u?.fullName ||
    u?.full_name ||
    u?.name ||
    u?.username ||
    u?.user?.fullName ||
    u?.user?.name ||
    "User"
  );
};

const extractUserImage = (u) => {
  if (!u) return "";
  return (
    u?.image ||
    u?.avatar ||
    u?.profileImage ||
    u?.profile_image ||
    u?.photo ||
    u?.user?.image ||
    ""
  );
};

// ─── TICK COMPONENT ──────────────────────────────────────────────────────────
// WhatsApp-style: single grey = sent, double grey = delivered, double blue = seen
function MessageTick({ isSeen, isDelivered, isTemp }) {
  if (isTemp) {
    // Clock icon while sending
    return (
      <Ionicons
        name="time-outline"
        size={12}
        color="rgba(255,255,255,0.5)"
        style={{ marginLeft: 3 }}
      />
    );
  }
  if (isSeen) {
    // Double blue tick = seen
    return (
      <View style={tick.wrap}>
        <Ionicons name="checkmark" size={12} color="#53BDEB" />
        <Ionicons
          name="checkmark"
          size={12}
          color="#53BDEB"
          style={tick.second}
        />
      </View>
    );
  }
  if (isDelivered) {
    // Double grey tick = delivered
    return (
      <View style={tick.wrap}>
        <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.6)" />
        <Ionicons
          name="checkmark"
          size={12}
          color="rgba(255,255,255,0.6)"
          style={tick.second}
        />
      </View>
    );
  }
  // Single grey tick = sent
  return (
    <Ionicons
      name="checkmark"
      size={12}
      color="rgba(255,255,255,0.6)"
      style={{ marginLeft: 3 }}
    />
  );
}

const tick = StyleSheet.create({
  wrap: { flexDirection: "row", marginLeft: 3 },
  second: { marginLeft: -6 },
});

// ─── MODALS ──────────────────────────────────────────────────────────────────

function InsufficientBalanceModal({ visible, balance, onAddMoney, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={cm.overlay}>
        <View style={cm.card}>
          <View style={cm.iconWrap}>
            <Ionicons name="wallet-outline" size={34} color="#867795" />
          </View>
          <Text style={cm.title}>Insufficient Balance</Text>
          <View style={cm.infoBox}>
            <View style={cm.infoRow}>
              <Text style={cm.infoLabel}>Required</Text>
              <Text style={[cm.infoValue, { color: "#ef4444" }]}>
                ₹150 minimum
              </Text>
            </View>
            <View style={[cm.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={cm.infoLabel}>Your Balance</Text>
              <Text style={[cm.infoValue, { color: "#ef4444" }]}>
                ₹{parseFloat(balance || 0).toFixed(2)}
              </Text>
            </View>
          </View>
          <Text style={cm.subtitle}>
            Add money to your wallet to start chatting with experts.
          </Text>
          <View style={cm.btnRow}>
            <TouchableOpacity
              style={cm.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={cm.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={cm.addBtn}
              onPress={onAddMoney}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={17} color={WHITE} />
              <Text style={cm.addTxt}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EndChatModal({
  visible,
  minutesUsed,
  ratePerMin,
  onEndChat,
  onStay,
  title,
  stayLabel,
}) {
  const rate = ratePerMin || 10;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={cm.overlay}>
        <View style={cm.card}>
          <View
            style={[
              cm.iconWrap,
              { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
            ]}
          >
            <Ionicons name="time-outline" size={34} color="#ef4444" />
          </View>
          <Text style={cm.title}>{title || "End Chat?"}</Text>
          <View style={cm.infoBox}>
            <View style={cm.infoRow}>
              <Text style={cm.infoLabel}>Duration</Text>
              <Text style={cm.infoValue}>{minutesUsed} min</Text>
            </View>
            <View style={[cm.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={cm.infoLabel}>Charged</Text>
              <Text style={[cm.infoValue, { color: "#ef4444" }]}>
                ₹{minutesUsed * rate}
              </Text>
            </View>
          </View>
          <Text style={cm.subtitle}>
            Remaining hold amount will be released back to your wallet.
          </Text>
          <View style={cm.btnRow}>
            <TouchableOpacity
              style={cm.stayBtn}
              onPress={onStay}
              activeOpacity={0.8}
            >
              <Text style={cm.stayTxt}>{stayLabel || "Stay"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={cm.endBtn}
              onPress={onEndChat}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={17} color={WHITE} />
              <Text style={cm.endTxt}>End Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DeleteSelectedModal({
  visible,
  count,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
  allMine,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={cm.overlay}>
          <TouchableWithoutFeedback>
            <View style={[cm.card, { paddingTop: 24, paddingBottom: 20 }]}>
              <View
                style={[
                  cm.iconWrap,
                  { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
                ]}
              >
                <Ionicons name="trash-outline" size={30} color="#ef4444" />
              </View>
              <Text style={cm.title}>
                Delete {count} message{count > 1 ? "s" : ""}?
              </Text>
              <View style={{ width: "100%", gap: 10 }}>
                {allMine && (
                  <TouchableOpacity
                    style={dm.optionBtn}
                    onPress={onDeleteForEveryone}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="people-outline" size={20} color="#ef4444" />
                    <View style={dm.optionText}>
                      <Text style={dm.optionTitle}>Delete for Everyone</Text>
                      <Text style={dm.optionSub}>
                        Remove for all participants
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={dm.optionBtn}
                  onPress={onDeleteForMe}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={20} color={TEAL} />
                  <View style={dm.optionText}>
                    <Text style={[dm.optionTitle, { color: TEAL }]}>
                      Delete for Me
                    </Text>
                    <Text style={dm.optionSub}>{"Only you won't see these"}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dm.optionBtn,
                    { borderColor: BORDER, backgroundColor: "#f9f9f9" },
                  ]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-outline" size={20} color={TEXT_2} />
                  <View style={dm.optionText}>
                    <Text style={[dm.optionTitle, { color: TEXT_2 }]}>
                      Cancel
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function DeleteConversationModal({
  visible,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={cm.overlay}>
          <TouchableWithoutFeedback>
            <View style={[cm.card, { paddingTop: 24, paddingBottom: 20 }]}>
              <View
                style={[
                  cm.iconWrap,
                  { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={30}
                  color="#ef4444"
                />
              </View>
              <Text style={cm.title}>Delete Conversation?</Text>
              <Text style={[cm.subtitle, { marginBottom: 16 }]}>
                Choose how you want to delete this conversation.
              </Text>
              <View style={{ width: "100%", gap: 10 }}>
                <TouchableOpacity
                  style={dm.optionBtn}
                  onPress={onDeleteForEveryone}
                  activeOpacity={0.8}
                >
                  <Ionicons name="people-outline" size={20} color="#ef4444" />
                  <View style={dm.optionText}>
                    <Text style={dm.optionTitle}>Delete for Everyone</Text>
                    <Text style={dm.optionSub}>
                      Removes chat for both sides
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dm.optionBtn}
                  onPress={onDeleteForMe}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={20} color={TEAL} />
                  <View style={dm.optionText}>
                    <Text style={[dm.optionTitle, { color: TEAL }]}>
                      Delete for Me
                    </Text>
                    <Text style={dm.optionSub}>Only clears your view</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dm.optionBtn,
                    { borderColor: BORDER, backgroundColor: "#f9f9f9" },
                  ]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-outline" size={20} color={TEXT_2} />
                  <View style={dm.optionText}>
                    <Text style={[dm.optionTitle, { color: TEXT_2 }]}>
                      Cancel
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const {
    expertId,
    name,
    avatar,
    expertName: paramExpertName,
    expertImage,
  } = useLocalSearchParams();

  const RECEIVER_ID = Number(expertId);
  const { clearUnread, setActiveChatUserId } = useNotification();

  const rawName = paramExpertName || name;
  const rawImage = expertImage || avatar;
  const expertName =
    rawName && rawName !== "undefined" && rawName !== "null"
      ? rawName
      : "Expert";
  const expertAvatarUrl = getImageUri(rawImage, expertName);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [expertDbId, setExpertDbId] = useState(null);
  const [ratePerMin, setRatePerMin] = useState(10);
  const [isCallLoading, setIsCallLoading] = useState(false);

  // ✅ NEW: Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConvModal, setDeleteConvModal] = useState(false);

  const [insufficientModal, setInsufficientModal] = useState({
    visible: false,
    balance: 0,
  });
  const [endChatModal, setEndChatModal] = useState({
    visible: false,
    isBackPress: false,
  });

  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const billingStarted = useRef(false);
  const tickIntervalRef = useRef(null);
  const minutesRef = useRef(0);
  const isSendingRef = useRef(false);
  const isInCallRef = useRef(false);
  const userDataRef = useRef({
    name: "User",
    image: "",
    id: null,
    role: "user",
  });
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        const role = (
          u?.role ||
          u?.userType ||
          u?.user?.role ||
          "user"
        ).toLowerCase();
        const uname = extractUserName(u);
        const image = extractUserImage(u);
        userDataRef.current = { name: uname, image, id: Number(uid), role };
        currentUserIdRef.current = Number(uid);
        setCurrentUserId(Number(uid));
        setUserRole(role);
      }
    });
  }, []);

  // ✅ Set active chat + mark messages seen when screen focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveChatUserId(RECEIVER_ID);
      clearUnread(RECEIVER_ID);

      // ✅ Mark all messages from RECEIVER_ID as seen
      if (currentUserIdRef.current) {
        API.post("/chat/seen", {
          viewerId: currentUserIdRef.current,
          senderId: RECEIVER_ID,
        }).catch(() => {});
      }

      return () => {
        setActiveChatUserId(null);
      };
    }, [RECEIVER_ID]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (
        billingStarted.current &&
        chatActive &&
        !tickIntervalRef.current &&
        currentUserId &&
        expertDbId
      ) {
        isInCallRef.current = false;
        startTickTimer(currentUserId, expertDbId);
      }
      return () => {
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
          tickIntervalRef.current = null;
          isInCallRef.current = true;
        }
      };
    }, [chatActive, currentUserId, expertDbId]),
  );

  // ✅ Exit selection mode on back press
  const handleBack = () => {
    if (selectionMode) {
      exitSelectionMode();
      return;
    }
    if (chatActive) {
      setEndChatModal({ visible: true, isBackPress: true });
    } else {
      router.back();
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  // ✅ Long press — enter selection mode and select first message
  const handleLongPress = (item) => {
    if (String(item.id).startsWith("temp_")) return;
    setSelectionMode(true);
    setSelectedIds(new Set([item.id]));
  };

  // ✅ Tap in selection mode — toggle selection
  const handleTapInSelection = (item) => {
    if (String(item.id).startsWith("temp_")) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        if (next.size === 0) {
          setSelectionMode(false);
        }
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  // ✅ Delete selected messages
  const handleDeleteSelected = async (deleteForEveryone) => {
    setShowDeleteModal(false);
    const idsToDelete = Array.from(selectedIds);
    exitSelectionMode();

    // Optimistically remove from UI
    setMessages((prev) => prev.filter((m) => !idsToDelete.includes(m.id)));

    try {
      await Promise.all(
        idsToDelete.map((msgId) =>
          API.post("/chat/delete/message", {
            messageId: msgId,
            userId: currentUserId,
            deleteForEveryone,
          }),
        ),
      );
    } catch (e) {
      console.log("Delete selected error:", e.message);
      loadChats();
    }
  };

  const handleDeleteConversation = async (deleteForEveryone) => {
    setDeleteConvModal(false);
    try {
      await API.post("/chat/delete/conversation", {
        userId: currentUserId,
        otherUserId: RECEIVER_ID,
        deleteForEveryone,
      });
      setMessages([]);
    } catch (e) {
      Alert.alert("Error", "Could not delete conversation.");
    }
  };

  // ✅ Check if all selected messages are sent by current user
  const allSelectedMine = () => {
    for (const id of selectedIds) {
      const msg = messages.find((m) => m.id === id);
      if (msg && Number(msg.sender_id) !== Number(currentUserId)) return false;
    }
    return true;
  };

  const findExpertId = async () => {
    try {
      const expertRes = await API.get("/experts");
      const allExperts = expertRes?.data?.data || [];
      const expert = allExperts.find(
        (e) => Number(e.userId) === Number(RECEIVER_ID),
      );
      return expert ? expert.id : RECEIVER_ID;
    } catch (e) {
      return RECEIVER_ID;
    }
  };

  const startChatBilling = async (userId) => {
    if (billingStarted.current) return;
    billingStarted.current = true;
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
        setRatePerMin(res.data.ratePerMin || 10);
        startTickTimer(userId, eId);
      }
    } catch (e) {
      billingStarted.current = false;
      const err = e?.response?.data;
      if (err?.error === "insufficient_balance") {
        setInsufficientModal({ visible: true, balance: err.balance || 0 });
      }
    }
  };

  const startTickTimer = (userId, eId) => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = setInterval(async () => {
      if (isInCallRef.current) return;
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
        const err = e?.response?.data;
        if (err?.error === "insufficient_balance")
          endChatBilling(userId, eId, true);
      }
    }, 60000);
  };

  const endChatBilling = async (userId, eId, autoEnded = false) => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    setChatActive(false);
    billingStarted.current = false;
    try {
      const res = await API.post("/wallet/chat-end", {
        userId,
        expertId: eId || expertDbId,
        minutesUsed: minutesRef.current,
      });
      if (res?.data?.success && autoEnded) router.back();
    } catch (e) {
      console.log("chatEnd error:", e.message);
    }
  };

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

  const handleSend = async () => {
    if (!textMessage.trim() || !RECEIVER_ID || !currentUserId) return;
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    const messageToSend = textMessage;
    setTextMessage("");

    if (userRole !== "expert" && !billingStarted.current) {
      await startChatBilling(currentUserId);
      if (!billingStarted.current) {
        isSendingRef.current = false;
        return;
      }
    }

    // ✅ Temp message with clock tick
    const tempId = `temp_${Date.now()}`;
    setMessages((prev) =>
      sortMessages([
        ...prev,
        {
          id: tempId,
          sender_id: currentUserId,
          receiver_id: RECEIVER_ID,
          message: messageToSend,
          is_seen: false,
          is_delivered: false,
          created_at: new Date(),
          _isTemp: true,
        },
      ]),
    );
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);

    try {
      const res = await API.post("/chat/send", {
        sender_id: currentUserId,
        receiver_id: RECEIVER_ID,
        message: messageToSend,
      });
      // ✅ Replace temp with real message (has is_delivered from server)
      const realMsg = res.data?.data;
      if (realMsg) {
        setMessages((prev) =>
          dedupeMessages(
            sortMessages(
              prev.map((m) =>
                m.id === tempId ? { ...realMsg, _isTemp: false } : m,
              ),
            ),
          ),
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      isSendingRef.current = false;
    }
  };

  const getCallerInfo = () => ({
    callerName: userDataRef.current.name || "User",
    callerImage: userDataRef.current.image || "",
  });

  const handleVoiceCall = async () => {
    if (isCallLoading || !currentUserId || userRole === "expert") return;
    setIsCallLoading(true);
    try {
      const { callerName, callerImage } = getCallerInfo();
      const res = await API.post("/calls/initiate", {
        callerId: currentUserId,
        receiverId: RECEIVER_ID,
        call_type: "voice",
        callerName,
        callerImage,
      });
      const callId = res.data?.id || res.data?.callId;
      if (!callId) {
        Alert.alert("Call Failed", "Could not initiate call.");
        return;
      }
      router.push({
        pathname: "/incall",
        params: {
          callId: String(callId),
          callerId: String(currentUserId),
          receiverId: String(RECEIVER_ID),
          expertName,
          expertImage: rawImage || "",
          callType: "voice",
          isCaller: "true",
          callerName,
          callerImage,
        },
      });
    } catch (e) {
      const err = e?.response?.data;
      if (err?.error === "insufficient_balance") {
        setInsufficientModal({ visible: true, balance: err.balance || 0 });
      } else {
        Alert.alert("Call Failed", err?.message || "Could not initiate call.");
      }
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleVideoCall = async () => {
    if (isCallLoading || !currentUserId || userRole === "expert") return;
    setIsCallLoading(true);
    try {
      const { callerName, callerImage } = getCallerInfo();
      const res = await API.post("/calls/initiate", {
        callerId: currentUserId,
        receiverId: RECEIVER_ID,
        call_type: "video",
        callerName,
        callerImage,
      });
      const callId = res.data?.id || res.data?.callId;
      if (!callId) {
        Alert.alert("Call Failed", "Could not initiate call.");
        return;
      }
      router.push({
        pathname: "/incall",
        params: {
          callId: String(callId),
          callerId: String(currentUserId),
          receiverId: String(RECEIVER_ID),
          expertName,
          expertImage: rawImage || "",
          callType: "video",
          isCaller: "true",
          callerName,
          callerImage,
        },
      });
    } catch (e) {
      const err = e?.response?.data;
      if (err?.error === "insufficient_balance") {
        setInsufficientModal({ visible: true, balance: err.balance || 0 });
      } else {
        Alert.alert("Call Failed", err?.message || "Could not initiate call.");
      }
    } finally {
      setIsCallLoading(false);
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
        setMessages((prev) =>
          dedupeMessages(
            sortMessages([...prev, { ...newMessage, is_delivered: true }]),
          ),
        );
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );

        // ✅ Mark as seen immediately since we're viewing the chat
        API.post("/chat/seen", {
          viewerId: currentUserId,
          senderId: newMessage.sender_id,
        }).catch(() => {});
      }
    });

    // ✅ NEW: Delivered event — update tick from single to double grey
    socketRef.current.on("message-delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_delivered: true } : m,
        ),
      );
    });

    // ✅ NEW: Seen event — update tick from grey to blue
    socketRef.current.on("messages-seen", ({ by }) => {
      if (Number(by) === Number(RECEIVER_ID)) {
        setMessages((prev) =>
          prev.map((m) =>
            Number(m.sender_id) === Number(currentUserId)
              ? { ...m, is_seen: true }
              : m,
          ),
        );
      }
    });

    return () => {
      socketRef.current?.off("receiveMessage");
      socketRef.current?.off("message-delivered");
      socketRef.current?.off("messages-seen");
      socketRef.current?.off("connect");
      socketRef.current?.off("disconnect");
      socketRef.current?.disconnect();
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [currentUserId, RECEIVER_ID]);

  // ─── Render message item ──────────────────────────────────────────────────
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
    const isSelected = selectedIds.has(item.id);
    const isTemp = !!item._isTemp;

    return (
      <TouchableOpacity
        activeOpacity={selectionMode ? 0.7 : 0.85}
        onLongPress={() => !selectionMode && handleLongPress(item)}
        onPress={() => selectionMode && handleTapInSelection(item)}
        delayLongPress={350}
      >
        {/* ✅ Selection highlight */}
        <View
          style={[
            styles.row,
            isUser ? styles.rowRight : styles.rowLeft,
            isSelected && { backgroundColor: SELECT_BG },
          ]}
        >
          {/* ✅ Selection checkbox on left */}
          {selectionMode && (
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={12} color={WHITE} />
              )}
            </View>
          )}

          {!isUser && !selectionMode && (
            <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
          )}

          <View
            style={[
              styles.bubble,
              isUser ? styles.bubbleMe : styles.bubbleThem,
            ]}
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
              {/* ✅ Show ticks only for sender's messages */}
              {isUser && (
                <MessageTick
                  isSeen={item.is_seen}
                  isDelivered={item.is_delivered}
                  isTemp={isTemp}
                />
              )}
            </View>
          </View>

          {!isUser && !selectionMode && <View style={{ width: 52 }} />}
        </View>
      </TouchableOpacity>
    );
  };

  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        backgroundColor={selectionMode ? "#1a1a2e" : TEAL}
        barStyle="light-content"
      />

      {chatActive && !selectionMode && (
        <View style={styles.billingBar}>
          <View style={styles.billingLeft}>
            <Text style={styles.billingTimer}>⏱️ {minutesUsed} min</Text>
            <Text style={styles.billingRate}>₹{ratePerMin}/min</Text>
          </View>
          <Text style={styles.billingBalance}>₹{walletBalance.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.endChatBtn}
            onPress={() =>
              setEndChatModal({ visible: true, isBackPress: false })
            }
          >
            <Text style={styles.endChatTxt}>End</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Selection mode header */}
      {selectionMode ? (
        <View style={[styles.header, { backgroundColor: "#1a1a2e" }]}>
          <TouchableOpacity style={styles.backBtn} onPress={exitSelectionMode}>
            <Ionicons name="close" size={22} color={WHITE} />
          </TouchableOpacity>
          <Text style={[styles.headerName, { color: WHITE, flex: 1 }]}>
            {selectedIds.size} selected
          </Text>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: "rgba(255,255,255,0.15)" },
            ]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={TEXT_1} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerAvatarPressable}
            onPress={() => {
              if (userRole !== "expert")
                router.push(`/(tabs)/expert/${RECEIVER_ID}`);
            }}
            activeOpacity={userRole !== "expert" ? 0.7 : 1}
          >
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
                  ]}
                >
                  {isOnline ? "Active now" : "Offline"}
                </Text>
              </View>
              {userRole !== "expert" && (
                <Text style={styles.viewProfileHint}>Tap to view profile</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {userRole !== "expert" && (
              <>
                <TouchableOpacity
                  style={[styles.iconBtn, isCallLoading && { opacity: 0.5 }]}
                  onPress={handleVideoCall}
                  disabled={isCallLoading}
                >
                  {isCallLoading ? (
                    <ActivityIndicator size="small" color={TEXT_1} />
                  ) : (
                    <Ionicons
                      name="videocam-outline"
                      size={20}
                      color={TEXT_1}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, isCallLoading && { opacity: 0.5 }]}
                  onPress={handleVoiceCall}
                  disabled={isCallLoading}
                >
                  {isCallLoading ? (
                    <ActivityIndicator size="small" color={TEXT_1} />
                  ) : (
                    <Ionicons name="call-outline" size={19} color={TEXT_1} />
                  )}
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setDeleteConvModal(true)}
            >
              <Ionicons name="ellipsis-vertical" size={19} color={TEXT_1} />
            </TouchableOpacity>
          </View>
        </View>
      )}

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

      {/* Hide input bar in selection mode */}
      {!selectionMode && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Ionicons name="add" size={22} color={TEAL} />
            </TouchableOpacity>
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
      )}

      {/* ─── Modals ─── */}
      <InsufficientBalanceModal
        visible={insufficientModal.visible}
        balance={insufficientModal.balance}
        onAddMoney={() => {
          setInsufficientModal({ visible: false, balance: 0 });
          router.push("/(tabs)/wallet");
        }}
        onCancel={() => {
          setInsufficientModal({ visible: false, balance: 0 });
          router.back();
        }}
      />

      <EndChatModal
        visible={endChatModal.visible}
        minutesUsed={minutesUsed}
        ratePerMin={ratePerMin}
        title="End Chat?"
        stayLabel={endChatModal.isBackPress ? "Stay" : "Continue"}
        onEndChat={() => {
          setEndChatModal({ visible: false, isBackPress: false });
          endChatBilling(currentUserId, expertDbId);
          router.back();
        }}
        onStay={() => setEndChatModal({ visible: false, isBackPress: false })}
      />

      {/* ✅ Delete selected messages modal */}
      <DeleteSelectedModal
        visible={showDeleteModal}
        count={selectedIds.size}
        allMine={allSelectedMine()}
        onDeleteForMe={() => handleDeleteSelected(false)}
        onDeleteForEveryone={() => handleDeleteSelected(true)}
        onCancel={() => setShowDeleteModal(false)}
      />

      <DeleteConversationModal
        visible={deleteConvModal}
        onDeleteForMe={() => handleDeleteConversation(false)}
        onDeleteForEveryone={() => handleDeleteConversation(true)}
        onCancel={() => setDeleteConvModal(false)}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CHAT_BG },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CHAT_BG,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: TEXT_2, fontWeight: "500" },
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f5f7",
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
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: 16,
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
  viewProfileHint: {
    fontSize: 10,
    color: TEAL_TEXT,
    fontWeight: "500",
    marginTop: 1,
    opacity: 0.7,
  },
  headerActions: { flexDirection: "row", gap: 6 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  chatBg: { flex: 1, backgroundColor: CHAT_BG },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingBottom: 10,
  },
  dateSepWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 8,
  },
  dateSepLine: { flex: 1, height: 0.5, backgroundColor: "#d1d5db" },
  dateSepPill: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  dateSepText: { fontSize: 12, color: TEXT_2, fontWeight: "600" },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
    paddingHorizontal: 4,
    borderRadius: 8,
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
  bubbleThem: {
    backgroundColor: BUBBLE_THEM,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextMe: { color: "#ffffff" },
  msgTextThem: { color: TEXT_1 },
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
  // ✅ Selection checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TEAL,
    marginRight: 8,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: { backgroundColor: TEAL, borderColor: TEAL },
  emptyChat: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyChatTitle: { fontSize: 17, fontWeight: "800", color: TEXT_1 },
  emptyChatSub: { fontSize: 14, color: TEXT_2, textAlign: "center" },
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
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendBtnDisabled: { backgroundColor: TEAL, opacity: 0.5 },
});

const cm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 14,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#f1f6f9",
    borderWidth: 1.5,
    borderColor: "#867795",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: TEXT_1,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f8f9ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8eeff",
  },
  infoLabel: { fontSize: 13, color: TEXT_2, fontWeight: "600" },
  infoValue: { fontSize: 15, color: TEXT_1, fontWeight: "800" },
  subtitle: {
    fontSize: 13,
    color: TEXT_2,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  btnRow: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#f5f6f8",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelTxt: { fontSize: 15, fontWeight: "700", color: TEXT_2 },
  stayBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#f5f6f8",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  stayTxt: { fontSize: 15, fontWeight: "700", color: TEXT_2 },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#867795",
    alignItems: "center",
    justifyContent: "center",
  },
  addTxt: { fontSize: 15, fontWeight: "800", color: WHITE },
  endBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  endTxt: { fontSize: 15, fontWeight: "800", color: WHITE },
});

const dm = StyleSheet.create({
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
    width: "100%",
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#ef4444" },
  optionSub: { fontSize: 12, color: TEXT_2, marginTop: 2 },
});
