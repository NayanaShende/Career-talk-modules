import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNotification } from "../../context/NotificationContext";
import { SOCKET_URL as BASE_URL } from "../../constants/config";

<<<<<<< HEAD
=======
const BASE_URL = "http://192.168.1.16:3000";
>>>>>>> 2cdf809b6f21dbc553adaa21529fb6e71e8c9563
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#eaddf5";
const TEAL_TEXT = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#eff0f2";

// ── Helpers ────────────────────────────────────────────────────────────────
const BG_CYCLE = ["#4a4869", "#2d6a5e", "#7a3d5e", "#1f5c8a", "#5e4a2d"];

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
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const cleanImage = image.replace(/^uploads\//, "");
    return `${BASE_URL}/uploads/${cleanImage}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Expert",
  )}&background=0B2D72&color=fff`;
};

// ── Main Component ─────────────────────────────────────────────────────────
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

  // ── Render chat item ───────────────────────────────────────────────────
  const renderChatItem = ({ item, index }) => {
    // ✅ Smart image URL handles Cloudinary URLs and local paths
    const avatarUri = getImageUri(item.avatar, item.name);
    const unread = unreadCounts[item.otherUserId] || 0;
    const timeStr = formatTime(item.lastMessageTime);
    const initials = item.name
      ? item.name
          .trim()
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "EX";
    const avatarBg = BG_CYCLE[index % BG_CYCLE.length];

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
        {/* ── Avatar ── */}
        <View style={styles.avatarWrap}>
          {item.avatar ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: avatarBg }]}
            >
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        {/* ── Text content ── */}
        <View style={styles.textWrap}>
          <View style={styles.topRow}>
            <Text
              style={[styles.name, unread > 0 && styles.nameUnread]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.date}>{timeStr}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text
              style={[styles.lastMsg, unread > 0 && styles.lastMsgUnread]}
              numberOfLines={1}
            >
              {item.lastMessage || "No messages yet"}
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
      </TouchableOpacity>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={TEAL} barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={TEAL_LIGHT} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSub}>
            {chatData.length > 0
              ? `${chatData.length} conversation${chatData.length !== 1 ? "s" : ""}`
              : "Your conversations"}
          </Text>
        </View>
        {(totalUnread > 0 || chatData.length > 0) && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {totalUnread > 0
                ? `${totalUnread > 99 ? "99+" : totalUnread} unread`
                : `${chatData.length} chats`}
            </Text>
          </View>
        )}
      </View>

      {/* ── LOADING ── */}
      {loading && chatData.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={chatData}
          renderItem={renderChatItem}
          keyExtractor={(item, index) => `chat_${item.otherUserId}_${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[TEAL]}
              tintColor={TEAL}
            />
          }
          ListHeaderComponent={
            chatData.length > 0 ? (
              <Text style={styles.listLabel}>Recent</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyEmoji}>💬</Text>
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySub}>
                Start chatting with an expert to get advice!
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/expert/search")}
              >
                <Text style={styles.emptyBtnText}>Find an Expert</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
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

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: TEAL_TEXT,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    elevation: 2,
    shadowColor: "#ffffff",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    marginTop: 22,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: PAGE_BG,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: PAGE_BG,
    marginTop: 2,
    fontWeight: "500",
  },
  headerBadge: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEAL_TEXT,
  },

  // ── List ──
  listContent: {
    paddingBottom: 30,
  },
  listLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_2,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },

  // ── Chat Row ──
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  // ── Avatar ──
  avatarWrap: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: CARD_BG,
  },

  // ── Text ──
  textWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_1,
    flex: 1,
    marginRight: 8,
  },
  nameUnread: {
    fontWeight: "800",
  },
  date: {
    fontSize: 11,
    color: TEXT_2,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMsg: {
    fontSize: 13,
    color: TEXT_2,
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  lastMsgUnread: {
    fontWeight: "700",
    color: TEXT_1,
  },
  unreadBadge: {
    backgroundColor: TEAL,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },

  // ── Divider ──
  divider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginLeft: 86,
  },

  // ── Empty state ──
  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_1,
  },
  emptySub: {
    fontSize: 14,
    color: TEXT_2,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 10,
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});