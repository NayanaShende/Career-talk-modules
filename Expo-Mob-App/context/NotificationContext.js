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

console.log("🚀 NotificationContext.js FILE LOADED");

const BASE_URL = "http://172.20.10.3:3000";

const NotificationContext = createContext({
  unreadCounts: {},
  clearUnread: () => {},
  totalUnread: 0,
  currentUserId: null,
  socket: null, // ✅ expose global socket so chatscreen reuses it
});

export function NotificationProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [banner, setBanner] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketRef = useRef(null);
  const bannerTimer = useRef(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const appState = useRef(AppState.currentState);

  // ✅ Try all possible storage keys + retry until found
  useEffect(() => {
    const tryLoadUser = async () => {
      try {
        const keys = ["user", "userData", "currentUser", "token"];
        let uid = null;

        for (const key of keys) {
          const str = await AsyncStorage.getItem(key);
          if (str) {
            try {
              const u = JSON.parse(str);
              uid = u?.id || u?.userId || u?.user?.id;
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

  // ✅ Single global socket — shared with chatscreen via context
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

    // ✅ Only NotificationContext handles newNotification — no chatscreen socket needed
    socket.on("newNotification", (notif) => {
      console.log("🔔 Global newNotification received:", notif);
      if (Number(notif.sender_id) !== Number(currentUserId)) {
        showBanner(notif);
        setUnreadCounts((prev) => ({
          ...prev,
          [notif.sender_id]: (prev[notif.sender_id] || 0) + 1,
        }));
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
      socket.off("connect");
      socket.off("reconnect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId]);

  // ✅ Rejoin room when app comes back to foreground
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
    setUnreadCounts((prev) => ({ ...prev, [userId]: 0 }));
  };

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCounts,
        clearUnread,
        totalUnread,
        currentUserId,
        socket: socketRef, // ✅ expose socketRef so chatscreen can use .current
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

// ✅ Required by Expo Router
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

