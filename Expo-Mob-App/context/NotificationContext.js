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

console.log("🚀 NotificationContext.js FILE LOADED");

import { BASE_URL } from "../constants/config";

const NotificationContext = createContext({
  unreadCounts: {},
  clearUnread: () => {},
  totalUnread: 0,
  currentUserId: null,
  socket: null,
  // ✅ NEW: set/clear which chat is currently open
  setActiveChatUserId: () => {},
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

  // ✅ NEW: Track which sender's chat is currently open on screen
  // When user is inside chatscreen with sender X, we skip unread++ for X
  const activeChatUserIdRef = useRef(null);

  const setActiveChatUserId = (userId) => {
    activeChatUserIdRef.current = userId ? Number(userId) : null;
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

  const navigateToIncomingCall = (data) => {
    const { callId, callerId, callType, callerName, callerImage } = data;
    try {
      router.push({
        pathname: "/incomingcall",
        params: {
          callId: String(callId),
          callerId: String(callerId),
          callerName: callerName || "User",
          callerImage: callerImage || "",
          callType: callType || "voice",
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
                  `👤 NotificationContext found userId ${uid} in key "${key}"`,
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
        currentUserId,
      );
      socket.emit("joinRoom", { userId: currentUserId });
      console.log("🏠 Global joinRoom emitted for:", currentUserId);
    });

    socket.on("reconnect", () => {
      console.log(
        "🔄 Global socket reconnected, rejoining room:",
        currentUserId,
      );
      socket.emit("joinRoom", { userId: currentUserId });
    });

    socket.on("newNotification", (notif) => {
      console.log("🔔 Global newNotification received:", notif);

      // ✅ Skip if this notification is from ourselves
      if (Number(notif.sender_id) === Number(currentUserId)) return;

      // ✅ FIX: Skip unread increment if user is currently viewing this sender's chat
      const isViewingThisChat =
        activeChatUserIdRef.current !== null &&
        Number(activeChatUserIdRef.current) === Number(notif.sender_id);

      if (!isViewingThisChat) {
        // Only show banner and increment if NOT currently in that chat
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
      const { receiverId } = data;
      if (Number(receiverId) !== Number(currentUserId)) return;
      if (!navReadyRef.current) {
        console.log("⏳ Nav not ready yet, queuing call...");
        pendingCallRef.current = data;
        return;
      }
      navigateToIncomingCall(data);
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

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log(
          "📱 App foregrounded, rejoining socket room:",
          currentUserId,
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
        setActiveChatUserId, // ✅ exposed to chat screen
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

