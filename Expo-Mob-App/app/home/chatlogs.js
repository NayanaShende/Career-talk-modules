import React, { useState, useEffect, useCallback } from "react";
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
import { useNotification } from "../../context/NotificationContext";

const BASE_URL = "http://192.168.1.14:3000";
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

// ✅ Smart image URL — handles Cloudinary full URLs AND local paths
const getImageUri = (image, name) => {
  if (
    image &&
    image !== "undefined" &&
    image !== "null" &&
    image.trim() !== ""
  ) {
    // Already a full URL (Cloudinary, S3, etc.) → use directly, no prefix needed
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    // Local path → strip leading "uploads/" if present, then prepend base URL
    const cleanImage = image.replace(/^uploads\//, "");
    return `${BASE_URL}/uploads/${cleanImage}`;
  }
  // Fallback to generated avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Expert",
  )}&background=0B2D72&color=fff`;
};

export default function ChatLogs() {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { unreadCounts, clearUnread, totalUnread } = useNotification();

  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        setCurrentUserId(Number(uid));
      }
    });
  }, []);

  const loadConversations = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(`/chat/conversations/${currentUserId}`);
      const data = res?.data?.data || [];
      setChatData(data);
    } catch (error) {
      console.log("Load conversations error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) loadConversations();
    }, [currentUserId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderChatItem = ({ item }) => {
    // ✅ avatar field comes directly from backend (full Cloudinary URL or local path)
    const avatarUri = getImageUri(item.avatar, item.name);
    const unread = unreadCounts[item.otherUserId] || 0;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => {
          clearUnread(item.otherUserId);
          router.push({
            pathname: "/home/chatscreen",
            params: {
              expertId: item.otherUserId,
              name: item.name,
              avatar: item.avatar || "",
            },
          });
        }}
      >
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.textWrap}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.rightCol}>
              <Text style={styles.date}>
                {formatTime(item.lastMessageTime)}
              </Text>
              {unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {unread > 99 ? "99+" : unread}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text
            style={[styles.status, unread > 0 && styles.statusUnread]}
            numberOfLines={1}
          >
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
        {totalUnread > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {totalUnread > 99 ? "99+" : totalUnread}
            </Text>
          </View>
        ) : chatData.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{chatData.length}</Text>
          </View>
        ) : null}
      </View>

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
          keyExtractor={(item, index) => `chat_${item.otherUserId}_${index}`}
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
  rightCol: { alignItems: "flex-end", gap: 4 },
  date: { fontSize: 11, color: "#9E9E9E" },
  unreadBadge: {
    backgroundColor: "#0B2D72",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  status: { fontSize: 13, color: "#757575", lineHeight: 18 },
  statusUnread: { fontWeight: "700", color: "#1A1A2E" },
  divider: { height: 1, backgroundColor: "#F0F0F5", marginLeft: 84 },
  emptyWrap: { alignItems: "center", marginTop: 100 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#333" },
  emptySubText: { fontSize: 14, color: "#999", marginTop: 6 },
});
