import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { io } from "socket.io-client"; // ✅ NEW

const BASE_URL = "http://192.168.1.27:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (date.toDateString() === today.toDateString())
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

export default function ChatLogs() {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const socketRef = useRef(null); // ✅ NEW

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

  // ✅ Fetch real conversations from API
  const loadConversations = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(`/chat/conversations/${currentUserId}`);
      setChatData(res?.data?.data || []);
    } catch (error) {
      console.log("Load conversations error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Reload every time screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) loadConversations();
    }, [currentUserId]),
  );

  // ✅ NEW: Socket connection for auto-refresh of chat list
  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      console.log("🟢 ChatLogs socket connected");
      // Join room so this screen receives messages meant for currentUser
      socketRef.current.emit("joinRoom", { userId: currentUserId });
    });

    // ✅ When a new message arrives → refresh conversation list instantly
    socketRef.current.on("receiveMessage", (newMessage) => {
      console.log("📩 New message received, refreshing chat list...");
      loadConversations(); // re-fetch list to show latest message + reorder
    });

    socketRef.current.on("disconnect", () => {
      console.log("🔌 ChatLogs socket disconnected");
    });

    return () => {
      socketRef.current.off("receiveMessage");
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.disconnect();
    };
  }, [currentUserId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderChatItem = ({ item }) => {
    const avatarUri = item.avatar
      ? `${BASE_URL}/uploads/${item.avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0B2D72&color=fff`;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/home/chatscreen",
            params: {
              expertId: item.otherUserId,
              name: item.name,
              avatar: item.avatar || "",
            },
          })
        }
      >
        {/* AVATAR with online dot */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.onlineDot} />
        </View>

        {/* NAME + LAST MESSAGE + TIME */}
        <View style={styles.textWrap}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.date}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          <Text style={styles.status} numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0B2D72" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {chatData.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{chatData.length}</Text>
          </View>
        )}
      </View>

      {/* LIST */}
      {loading && chatData.length === 0 ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color="#0B2D72"
          size="large"
        />
      ) : (
        <FlatList
          data={chatData}
          renderItem={renderChatItem}
          keyExtractor={(item) => String(item.id || item.otherUserId)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0B2D72"]}
              tintColor="#0B2D72"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>
                Start chatting with an expert!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  countText: { fontSize: 12, fontWeight: "700", color: "#0B2D72" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  avatarWrap: { position: "relative", marginRight: 14 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#E8EAF6",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#25D366",
    borderWidth: 2,
    borderColor: "#fff",
  },

  textWrap: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    flex: 1,
    marginRight: 8,
  },
  date: { fontSize: 11, color: "#9E9E9E" },
  status: { fontSize: 13, color: "#757575", lineHeight: 18 },

  divider: { height: 1, backgroundColor: "#F0F0F5", marginLeft: 84 },

  emptyWrap: { alignItems: "center", marginTop: 100 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#333" },
  emptySubText: { fontSize: 14, color: "#999", marginTop: 6 },
});
