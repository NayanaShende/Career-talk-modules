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
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNotification } from "../../context/NotificationContext";

const { width } = Dimensions.get("window");
import { BASE_URL } from "../../constants/config";
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
function MessageTick({ isSeen, isDelivered, isTemp }) {
  if (isTemp) {
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
                    <Text style={dm.optionSub}>
                      {"Only you won't see these"}
                    </Text>
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
    ratePerMin: paramRatePerMin,
  } = useLocalSearchParams();

  const RECEIVER_ID = Number(expertId);

  const rawName = paramExpertName || name;
  const rawImage = expertImage || avatar;
  const expertName =
    rawName && rawName !== "undefined" && rawName !== "null"
      ? rawName
      : "Expert";
  const expertAvatarUrl = getImageUri(rawImage, expertName);

  // ── Core state
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConvModal, setDeleteConvModal] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);

  // ── Billing state
  const [chatActive, setChatActive] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingFailed, setBillingFailed] = useState(false);
  const [balanceInsufficient, setBalanceInsufficient] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [expertDbId, setExpertDbId] = useState(null);
  const [ratePerMin, setRatePerMin] = useState(
    parseInt(paramRatePerMin, 10) || 10,
  );

  // ── End chat modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [endModalData, setEndModalData] = useState(null);

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
  const preauthDone = useRef(false);
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

  // ✅ Store current user's own name & image to pass as callerName/callerImage
  const currentUserNameRef = useRef("User");
  const currentUserImageRef = useRef("");

  const { setActiveChatUserId, clearUnread } = useNotification();

  // ── Load user from storage
  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        const role = (u?.role || u?.userType || "user").toLowerCase();
        setCurrentUserId(Number(uid));
        currentUserIdRef.current = Number(uid);
        setUserRole(role);

        // ✅ Capture caller's own name & image for call screens
        currentUserNameRef.current =
          u?.fullName ||
          u?.full_name ||
          u?.name ||
          u?.username ||
          u?.user?.fullName ||
          u?.user?.name ||
          "User";
        currentUserImageRef.current =
          u?.image ||
          u?.avatar ||
          u?.profileImage ||
          u?.profile_image ||
          u?.photo ||
          u?.user?.image ||
          "";
      }
    });
  }, []);

  // ── FIX: Fetch expertDbId on mount so profile navigation works before any message is sent
  useEffect(() => {
    if (!RECEIVER_ID) return;
    findExpertId().then((eId) => {
      setExpertDbId(eId);
    });
  }, [RECEIVER_ID]);

  useFocusEffect(
    React.useCallback(() => {
      setActiveChatUserId(RECEIVER_ID);
      clearUnread(RECEIVER_ID);

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

  const handleLongPress = (item) => {
    if (String(item.id).startsWith("temp_")) return;
    setSelectionMode(true);
    setSelectedIds(new Set([item.id]));
  };

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

  const handleDeleteSelected = async (deleteForEveryone) => {
    setShowDeleteModal(false);
    const idsToDelete = Array.from(selectedIds);
    exitSelectionMode();

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

  const allSelectedMine = () => {
    for (const id of selectedIds) {
      const msg = messages.find((m) => m.id === id);
      if (msg && Number(msg.sender_id) !== Number(currentUserId)) return false;
    }
    return true;
  };

  // ─── CALL HELPERS ─────────────────────────────────────────────────────────

  // ✅ Check wallet balance before initiating call
  const checkCallBalance = async () => {
    try {
      const res = await API.get(`/wallet/balance/${currentUserId}`);
      const bal = parseFloat(res?.data?.balance || 0);
      const minRequired = ratePerMin * 5;
      if (bal < minRequired) {
        setInsufficientModal({ visible: true, balance: bal });
        return false;
      }
      return true;
    } catch (err) {
      console.log("Call balance check error:", err.message);
      return true; // let backend gate if network issue
    }
  };

  // ✅ Shared call initiator — callType: "audio" | "video"
  const initiateCall = async (callType) => {
    if (userRole === "expert") return; // experts cannot initiate calls
    if (!currentUserId) {
      Alert.alert("Error", "Could not identify your account. Please try again.");
      return;
    }
    if (isCallLoading) return;

    setIsCallLoading(true);

    try {
      // 1️⃣ Frontend balance check
      const hasBalance = await checkCallBalance();
      if (!hasBalance) {
        setIsCallLoading(false);
        return;
      }

      // 2️⃣ Create call record on backend → get callId
      const res = await API.post("/calls/initiate", {
        callerId: currentUserId,
        receiverId: RECEIVER_ID,
        callType, // ✅ "audio" or "video"
      });

      const callId =
        res?.data?.callId || res?.data?.call?.id || res?.data?.id;

      if (!callId) {
        throw new Error(res?.data?.message || "No callId returned from server");
      }

      console.log(`📞 Call initiated: callId=${callId} type=${callType}`);

      // 3️⃣ Notify expert via socket
      if (socketRef.current?.connected) {
        socketRef.current.emit("call-invite", {
          callId:      String(callId),
          callerId:    currentUserId,
          receiverId:  RECEIVER_ID,
          callType:    callType,
          callerName:  currentUserNameRef.current,
          callerImage: currentUserImageRef.current,
        });
        console.log(`📡 Emitted call-invite: type=${callType} to receiverId=${RECEIVER_ID}`);
      }

      // 4️⃣ Pause chat billing tick while in call
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
        isInCallRef.current = true;
      }

      // 5️⃣ Navigate caller to incall screen
      router.push({
        pathname: "/incall",
        params: {
          callId:      String(callId),
          callerId:    String(currentUserId),
          receiverId:  String(RECEIVER_ID),
          expertName:  expertName,
          expertImage: rawImage || "",
          callType:    callType,
          isCaller:    "true",
          callerName:  currentUserNameRef.current,
          callerImage: currentUserImageRef.current,
        },
      });
    } catch (err) {
      console.log("initiateCall error:", err?.response?.data || err.message);
      const errData = err?.response?.data;
      if (errData?.error === "insufficient_balance") {
        setInsufficientModal({ visible: true, balance: errData?.balance || 0 });
      } else {
        Alert.alert(
          "Call Failed",
          errData?.message || err.message || "Could not start the call. Please try again.",
          [{ text: "OK" }],
        );
      }
    } finally {
      setIsCallLoading(false);
    }
  };

  // ✅ Header button handlers
  const handleVideoCall = () => initiateCall("video");
  const handleVoiceCall = () => initiateCall("audio");

  // ─── BILLING HELPERS ──────────────────────────────────────────────────────

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

  const checkWalletBalance = async (userId) => {
    try {
      const res = await API.get(`/wallet/balance/${userId}`);
      const bal = parseFloat(res?.data?.balance || 0);
      const minRequired = ratePerMin * 5;
      setCurrentBalance(bal);
      if (bal < minRequired) {
        setBalanceInsufficient(true);
      }
    } catch (err) {
      console.log("balance pre-check error:", err.message);
      setInsufficientModal({
        visible: true,
        balance: err.balance || 0,
      });
    }
  };

  const startExpertVisualTimer = () => {
    tickIntervalRef.current = setInterval(() => {
      minutesRef.current += 1;
      setMinutesUsed(minutesRef.current);
    }, 60000);
  };

  const startTickTimer = (userId, eId) => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = setInterval(async () => {
      minutesRef.current += 1;
      setMinutesUsed(minutesRef.current);

      try {
        const res = await API.post("/wallet/chat-tick", {
          userId: userId,
          expertId: eId,
        });
        if (res?.data?.success) {
          setCurrentBalance(res.data.balance);
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
        userId: userId,
        expertId: eId || expertDbId,
        minutesUsed: minutesRef.current,
      });

      if (res?.data?.success) {
        const { totalCharged, released, duration } = res.data;
        if (autoEnded) router.back();
        setEndModalData({ totalCharged, released, duration, autoEnded });
        setShowEndModal(true);
      }
    } catch (e) {
      console.log("chatEnd error:", e.message);
      if (autoEnded) router.back();
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

  // ─── SOCKET SETUP ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId || !RECEIVER_ID) return;

    loadChats();

    if (userRole !== "expert") {
      checkWalletBalance(currentUserId);
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
          dedupeMessages(
            sortMessages([...prev, { ...newMessage, is_delivered: true }]),
          ),
        );
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );

        API.post("/chat/seen", {
          viewerId: currentUserId,
          senderId: newMessage.sender_id,
        }).catch(() => {});
      }
    });

    socketRef.current.on("message-delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_delivered: true } : m,
        ),
      );
    });

    socketRef.current.on("messages-seen", ({ by }) => {
      if (Number(by) === Number(RECEIVER_ID)) {
        setMessages((prev) =>
          prev.map((m) =>
            Number(m.sender_id) === Number(currentUserId)
              ? { ...m, is_seen: true }
              : m,
          ),
        );

        if (userRole === "expert" && !preauthDone.current) {
          preauthDone.current = true;
          setChatActive(true);
          startExpertVisualTimer();
        }

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // ✅ NOTE: incoming-call is handled by NotificationContext global socket.
    // Do NOT add an incoming-call listener here — it causes double navigation
    // with stale/wrong callType data overwriting the correct one.

    // ✅ Call feedback events (caller side)
    socketRef.current.on("call-rejected", ({ callId }) => {
      console.log("📵 Call rejected by expert, callId:", callId);
      setIsCallLoading(false);
      Alert.alert("Call Declined", `${expertName} is unavailable right now.`);
    });

    socketRef.current.on("call-cancelled", ({ callId }) => {
      console.log("🚫 Call cancelled, callId:", callId);
      setIsCallLoading(false);
    });

    return () => {
      socketRef.current?.off("receiveMessage");
      socketRef.current?.off("message-delivered");
      socketRef.current?.off("messages-seen");
      socketRef.current?.off("call-rejected");
      socketRef.current?.off("call-cancelled");
      socketRef.current?.off("connect");
      socketRef.current?.off("disconnect");
      socketRef.current?.disconnect();
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [currentUserId, RECEIVER_ID]);

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!textMessage.trim() || !RECEIVER_ID || !currentUserId) return;
    if (isSendingRef.current) return;
    if (billingLoading) return;

    const messageToSend = textMessage;

    if (userRole !== "expert" && !preauthDone.current) {
      setTextMessage("");
      setBillingLoading(true);
      setBillingFailed(false);

      try {
        // Use already-fetched expertDbId if available, otherwise fetch
        const eId = expertDbId || (await findExpertId());
        if (!expertDbId) setExpertDbId(eId);

        const res = await API.post("/wallet/chat-start", {
          userId: currentUserId,
          expertId: eId,
        });

        if (res?.data?.success) {
          preauthDone.current = true;
          billingStarted.current = true;
          setChatActive(true);
          setCurrentBalance(res.data.balance);
          if (res.data.ratePerMin) setRatePerMin(res.data.ratePerMin);
          startTickTimer(currentUserId, eId);
        }
      } catch (e) {
        const err = e?.response?.data;
        setBillingLoading(false);
        setBillingFailed(true);

        if (err?.error === "insufficient_balance") {
          setCurrentBalance(err.balance || 0);
          setBalanceInsufficient(true);
        } else {
          Alert.alert(
            "Chat Start Failed",
            "Could not start chat session. Please try again.",
            [{ text: "OK" }],
          );
        }
        return;
      }

      setBillingLoading(false);
    } else if (userRole === "expert" && !preauthDone.current) {
      preauthDone.current = true;
      setChatActive(true);
      startExpertVisualTimer();
    }

    isSendingRef.current = true;

    const tempId = `temp_${Date.now()}`;
    setTextMessage("");
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
    } finally {
      isSendingRef.current = false;
    }
  };

  // ─── RENDER MESSAGE ───────────────────────────────────────────────────────
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
    const isTemp = String(item.id).startsWith("temp_");

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => handleLongPress(item)}
        onPress={() => selectionMode && handleTapInSelection(item)}
        style={[
          styles.row,
          isUser ? styles.rowRight : styles.rowLeft,
          isSelected && { backgroundColor: SELECT_BG },
        ]}
      >
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
              <MessageTick
                isSeen={item.is_seen}
                isDelivered={item.is_delivered}
                isTemp={isTemp}
              />
            )}
          </View>
        </View>

        {!isUser && !selectionMode && <View style={{ width: 52 }} />}
      </TouchableOpacity>
    );
  };

  // ── FIX: Use expertDbId for profile navigation (falls back to RECEIVER_ID)
  const handleHeaderPress = () => {
    if (userRole !== "expert") {
      const profileId = expertDbId || RECEIVER_ID;
      router.push(`/(tabs)/expert/${profileId}`);
    }
  };

  const isLowBalance =
    chatActive && currentBalance > 0 && currentBalance < ratePerMin * 2;
  const isUserRole = userRole !== "expert";
  const inputDisabled = billingLoading;
  const sendDisabled = !textMessage.trim() || inputDisabled;

  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        backgroundColor={selectionMode ? "#1a1a2e" : TEAL}
        barStyle="light-content"
      />

      {/* ── INSUFFICIENT BALANCE OVERLAY ── */}
      {balanceInsufficient && !chatActive && (
        <View style={styles.insufficientOverlay}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Insufficient balance. Please add money.
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/wallet")}>
            <Text style={{ color: "#fbbf24", fontWeight: "800", marginTop: 8 }}>
              Add Money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── BILLING LOADING BANNER ── */}
      {billingLoading && (
        <View style={styles.billingLoadingBar}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.billingLoadingText}>
            Starting your chat session...
          </Text>
        </View>
      )}

      {/* ── BILLING ACTIVE BAR ── */}
      {chatActive && !billingLoading && (
        <View style={styles.billingBar}>
          <View style={styles.billingLeft}>
            <Text style={styles.billingTimer}>⏱️ {minutesUsed} min</Text>
            <Text style={styles.billingRate}>₹{ratePerMin}/min</Text>
          </View>
          <Text style={styles.billingBalance}>
            ₹{parseFloat(currentBalance).toFixed(2)}
          </Text>
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

      {/* ── LOW BALANCE WARNING BANNER ── */}
      {isLowBalance && (
        <View style={styles.lowBalanceBanner}>
          <Ionicons name="warning" size={14} color="#92400e" />
          <Text style={styles.lowBalanceText}>
            ⚠️ Low balance! Only ₹{parseFloat(currentBalance).toFixed(0)}{" "}
            left.{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/wallet")}>
            <Text style={styles.lowBalanceLink}>Add Money →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={22} color={TEXT_1} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerAvatarPressable}
          onPress={handleHeaderPress}
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
            <Text style={styles.headerName}>{expertName}</Text>
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
          {/* ✅ Call buttons — only for non-expert (jobseeker/user) */}
          {userRole !== "expert" && (
            <>
              {/* Video call */}
              <TouchableOpacity
                style={[styles.iconBtn, isCallLoading && { opacity: 0.5 }]}
                onPress={handleVideoCall}
                disabled={isCallLoading}
              >
                {isCallLoading ? (
                  <ActivityIndicator size="small" color={TEXT_1} />
                ) : (
                  <Ionicons name="videocam-outline" size={20} color={TEXT_1} />
                )}
              </TouchableOpacity>
              {/* Voice call */}
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

      {/* ── CHAT LIST ── */}
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
                  {isUserRole
                    ? `Send a message to ${expertName} — billing starts with your first message.`
                    : `Send a message to ${expertName}`}
                </Text>
                {isUserRole && (
                  <View style={styles.ratePill}>
                    <Ionicons
                      name="pricetag-outline"
                      size={12}
                      color={TEAL_TEXT}
                    />
                    <Text style={styles.ratePillText}>
                      ₹{ratePerMin} / minute · Min ₹{ratePerMin * 5} to start
                    </Text>
                  </View>
                )}
              </View>
            }
          />
        )}
      </View>

      {/* ── INPUT BAR ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {billingFailed && !billingLoading && !chatActive && (
          <View style={styles.billingFailedBanner}>
            <Ionicons name="alert-circle" size={14} color="#7f1d1d" />
            <Text style={styles.billingFailedText}>
              Failed to start session.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setBillingFailed(false);
              }}
            >
              <Text style={styles.billingFailedRetry}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputBar, inputDisabled && styles.inputBarLocked]}>
          <TouchableOpacity style={styles.attachBtn} disabled={inputDisabled}>
            <Ionicons
              name="add"
              size={22}
              color={inputDisabled ? "#ccc" : TEAL}
            />
          </TouchableOpacity>

          <View style={styles.inputWrap}>
            {billingLoading ? (
              <View style={styles.billingInputPlaceholder}>
                <ActivityIndicator
                  size="small"
                  color={TEAL}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.billingInputPlaceholderText}>
                  Starting session...
                </Text>
              </View>
            ) : (
              <>
                <TextInput
                  placeholder={
                    isUserRole && !chatActive
                      ? "Type your first message to start..."
                      : "Type a message..."
                  }
                  placeholderTextColor="#AAAAAA"
                  style={styles.input}
                  value={textMessage}
                  onChangeText={setTextMessage}
                  multiline
                  editable={!inputDisabled}
                />
                {!textMessage.trim() && (
                  <TouchableOpacity style={styles.micBtn}>
                    <Ionicons name="mic-outline" size={20} color={TEXT_2} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, sendDisabled && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sendDisabled}
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

      {/* ── MODALS ── */}
      <InsufficientBalanceModal
        visible={insufficientModal.visible}
        balance={insufficientModal.balance}
        onAddMoney={() => {
          setInsufficientModal({ visible: false, balance: 0 });
          router.push("/(tabs)/wallet");
        }}
        onCancel={() => {
          setInsufficientModal({ visible: false, balance: 0 });
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
  insufficientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: TEXT_2, fontWeight: "500" },
  billingLoadingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 9,
    gap: 10,
  },
  billingLoadingText: { color: "#fff", fontSize: 13, fontWeight: "600" },
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
  lowBalanceBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7",
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  lowBalanceText: { color: "#92400e", fontSize: 12, fontWeight: "600" },
  lowBalanceLink: {
    color: "#b45309",
    fontSize: 12,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  billingFailedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#fecaca",
  },
  billingFailedText: {
    flex: 1,
    color: "#7f1d1d",
    fontSize: 12,
    fontWeight: "600",
  },
  billingFailedRetry: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
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
  emptyChat: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
    paddingHorizontal: 24,
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
  emptyChatTitle: { fontSize: 17, fontWeight: "800", color: TEXT_1 },
  emptyChatSub: { fontSize: 14, color: TEXT_2, textAlign: "center" },
  ratePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratePillText: { fontSize: 11, color: TEAL_TEXT, fontWeight: "600" },
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
  inputBarLocked: { backgroundColor: "#f9fafb" },
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
  billingInputPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
  },
  billingInputPlaceholderText: {
    color: TEXT_2,
    fontSize: 14,
    fontStyle: "italic",
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
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#ef4444" },
  optionSub: { fontSize: 12, color: TEXT_2, marginTop: 2 },
});