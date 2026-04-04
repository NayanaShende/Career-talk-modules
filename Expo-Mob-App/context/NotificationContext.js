import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AppState,
} from "react-native";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

console.log("🚀 Notification sync");

import { BASE_URL } from "../constants/config";

const NotificationContext = createContext({
  unreadCounts: {},
  clearUnread: () => {},
  totalUnread: 0,
  currentUserId: null,
  socket: null,
  setActiveChatUserId: () => {},
  // ✅ NEW: exposed so incomingcall.js can read latest callType
  getLatestCallType: () => "audio",
});

export function NotificationProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [banner, setBanner] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketRef = useRef(null);
  const bannerTimer = useRef(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const appState = useRef(AppState.currentState);
  const navReadyRef = useRef(false);
  const pendingCallRef = useRef(null);
  const activeChatUserIdRef = useRef(null);

  // ✅ KEY FIX: Store latest callType per callerId so incomingcall.js can read it
  // Format: { "35": "video", "42": "audio" }
  const latestCallTypeRef = useRef({});

  const setActiveChatUserId = (userId) => {
    activeChatUserIdRef.current = userId ? Number(userId) : null;
  };

  // ✅ Exposed via context — incomingcall.js calls this to get correct callType
  const getLatestCallType = (callerId) => {
    if (!callerId) return "audio";
    return latestCallTypeRef.current[String(callerId)] || "audio";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navReadyRef.current = true;
      console.log("✅ Navigation is ready");
      if (pendingCallRef.current) {
        console.log("📲 Flushing pending incoming call navigation");
        navigateToIncomingCall(pendingCallRef.current);
        pendingCallRef.current = null;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const normaliseCallType = (raw) => {
    if (!raw || raw === "undefined" || raw === "null") return "audio";
    const s = raw.trim().toLowerCase();
    if (s === "video") return "video";
    return "audio"; // "voice", "audio", anything else → "audio"
  };

  const navigateToIncomingCall = (data) => {
    const { callId, callerId, callType, callerName, callerImage } = data;
    const normType = normaliseCallType(callType);

    // ✅ Always store/update latest callType for this caller
    latestCallTypeRef.current[String(callerId)] = normType;
    console.log(
      `📞 navigateToIncomingCall: callerId=${callerId} callType=${normType} (raw: ${callType})`
    );

    try {
      router.push({
        pathname: "/incomingcall",
        params: {
          callId:      String(callId),
          callerId:    String(callerId),
          callerName:  callerName || "User",
          callerImage: callerImage || "",
          callType:    normType,  // ✅ normalised: "audio" or "video"
        },
      });
      console.log(`📲 Navigated to /incomingcall for callId: ${callId}`);
    } catch (err) {
      console.log("❌ router.push error:", err.message);
    }
  };

  useEffect(() => {
    const tryLoadUser = async () => {
      try {
        const keys = ["user", "userData", "currentUser", "token"];
        let uid = null;
        let role = "user";
        for (const key of keys) {
          const str = await AsyncStorage.getItem(key);
          if (str) {
            try {
              const u = JSON.parse(str);
              uid = u?.id || u?.userId || u?.user?.id;
              role = (u?.role || u?.userType || "user").toLowerCase();
              if (uid) {
                console.log(
                  `👤 NotificationContext found userId ${uid} in key "${key}"`
                );
                break;
              }
            } catch {
              // not JSON, skip
            }
          }
        }
        if (uid) {
          setCurrentUserId(Number(uid));
          setUserRole(role);
          return;
        }
      } catch (e) {
        console.log("AsyncStorage error:", e.message);
      }
      setTimeout(tryLoadUser, 1000);
    };
    tryLoadUser();
  }, []);

  const showBanner = (notif) => {
    setBanner(notif);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => hideBanner(), 4000);
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setBanner(null));
  };

  useEffect(() => {
    if (!currentUserId) return;

    console.log("🔌 Connecting global socket for user:", currentUserId);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "🌐 Global socket connected:",
        socket.id,
        "for user:",
        currentUserId
      );
      socket.emit("joinRoom", { userId: currentUserId });
      console.log("🏠 Global joinRoom emitted for:", currentUserId);
    });

    socket.on("reconnect", () => {
      console.log(
        "🔄 Global socket reconnected, rejoining room:",
        currentUserId
      );
      socket.emit("joinRoom", { userId: currentUserId });
    });

    socket.on("newNotification", (notif) => {
      console.log("🔔 Global newNotification received:", notif);
      if (Number(notif.sender_id) === Number(currentUserId)) return;

      const isViewingThisChat =
        activeChatUserIdRef.current !== null &&
        Number(activeChatUserIdRef.current) === Number(notif.sender_id);

      if (!isViewingThisChat) {
        showBanner(notif);
        setUnreadCounts((prev) => ({
          ...prev,
          [notif.sender_id]: (prev[notif.sender_id] || 0) + 1,
        }));
      } else {
        console.log("💬 User is viewing this chat — skipping unread increment");
      }
    });

    socket.on("incoming-call", (data) => {
      console.log("📞 incoming-call received:", data);
      const { receiverId, callerId, callType } = data;

      // ✅ Always update latestCallTypeRef even for duplicate events
      // The second event (from call-invite relay) has the CORRECT callType ("video")
      // so we always overwrite with the latest value
      const normType = normaliseCallType(callType);
      latestCallTypeRef.current[String(callerId)] = normType;
      console.log(
        `🔄 Updated latestCallType for caller ${callerId}: ${normType}`
      );

      // Only navigate for the intended receiver
      if (Number(receiverId) !== Number(currentUserId)) return;

      if (!navReadyRef.current) {
        console.log("⏳ Nav not ready yet, queuing call...");
        // ✅ Always overwrite pending with latest data (has correct callType)
        pendingCallRef.current = { ...data, callType: normType };
        return;
      }

      // ✅ First event (backend): navigate immediately with whatever callType we have
      // ✅ Second event (call-invite relay): update latestCallTypeRef — 
      //    incomingcall.js will read this on Accept via getLatestCallType()
      if (!isScreenAlreadyOpen(callerId)) {
        navigateToIncomingCall({ ...data, callType: normType });
      } else {
        // Screen is open — just update the stored callType
        // incomingcall.js reads getLatestCallType() on Accept button press
        console.log(
          `🔄 IncomingCall screen already open, updated callType to: ${normType}`
        );
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Global socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Global socket connect error:", err.message);
    });

    return () => {
      socket.off("newNotification");
      socket.off("incoming-call");
      socket.off("connect");
      socket.off("reconnect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId]);

  // ✅ Track which callers have an open incomingcall screen
  const openCallScreensRef = useRef(new Set());

  const isScreenAlreadyOpen = (callerId) => {
    return openCallScreensRef.current.has(String(callerId));
  };

  const markCallScreenOpen = (callerId) => {
    openCallScreensRef.current.add(String(callerId));
  };

  const markCallScreenClosed = (callerId) => {
    openCallScreensRef.current.delete(String(callerId));
    // Clean up stored callType
    delete latestCallTypeRef.current[String(callerId)];
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log(
          "📱 App foregrounded, rejoining socket room:",
          currentUserId
        );
        if (socketRef.current?.connected && currentUserId) {
          socketRef.current.emit("joinRoom", { userId: currentUserId });
        } else if (currentUserId) {
          socketRef.current?.connect();
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [currentUserId]);

  const clearUnread = (userId) => {
    setUnreadCounts((prev) => ({ ...prev, [Number(userId)]: 0 }));
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCounts,
        clearUnread,
        totalUnread,
        currentUserId,
        userRole,
        socket: socketRef,
        setActiveChatUserId,
        // ✅ NEW: exposed for incomingcall.js
        getLatestCallType,
        markCallScreenOpen,
        markCallScreenClosed,
      }}
    >
      {children}

      {banner && (
        <Animated.View
          style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.bannerIcon}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {banner.title || "New Message"}
            </Text>
            <Text style={styles.bannerMsg} numberOfLines={1}>
              {banner.message}
            </Text>
          </View>
          <TouchableOpacity onPress={hideBanner}>
            <Text style={styles.bannerClose}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}

export default function NotificationContextScreen() {
  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  bannerIcon: { fontSize: 22 },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  bannerMsg: { fontSize: 13, color: "#ccc" },
  bannerClose: { fontSize: 16, color: "#fff", paddingLeft: 8 },
});