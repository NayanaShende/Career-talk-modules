import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Modal,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNotification } from "../../context/NotificationContext";
import { BASE_URL } from "../../constants/config";

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
const DELETE_RED = "#ef4444";
const SELECT_BG = "#f3e8ff";
const WHITE = "#ffffff";

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
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=0B2D72&color=fff`;
};

// ── Delete Conversation Modal (same style as chatscreen) ───────────────────
function DeleteConversationModal({
  visible,
  count,
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
              {/* Icon */}
              <View
                style={[
                  cm.iconWrap,
                  { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={30}
                  color={DELETE_RED}
                />
              </View>

              {/* Title */}
              <Text style={cm.title}>
                Delete {count} Conversation{count > 1 ? "s" : ""}?
              </Text>
              <Text style={cm.subtitle}>
                Choose how you want to delete{" "}
                {count > 1 ? "these conversations" : "this conversation"}.
              </Text>

              {/* Options */}
              <View style={{ width: "100%", gap: 10 }}>
                {/* Delete for Everyone */}
                <TouchableOpacity
                  style={dm.optionBtn}
                  onPress={onDeleteForEveryone}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={DELETE_RED}
                  />
                  <View style={dm.optionText}>
                    <Text style={dm.optionTitle}>Delete for Everyone</Text>
                    <Text style={dm.optionSub}>
                      Removes chat for both sides
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Delete for Me */}
                <TouchableOpacity
                  style={[
                    dm.optionBtn,
                    { borderColor: TEAL_LIGHT, backgroundColor: TEAL_LIGHT },
                  ]}
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

                {/* Cancel */}
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function ChatLogs() {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const { unreadCounts, clearUnread, totalUnread } = useNotification();

  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        const role = u?.role || u?.user?.role || "user";
        setCurrentUserId(Number(uid));
        setUserRole(role);
        console.log("👤 ChatLogs userId:", uid, "role:", role);
      }
    });
  }, []);

  const loadConversations = async () => {
    if (!currentUserId || !userRole) return;
    try {
      setLoading(true);
      // ✅ Expert uses different endpoint
      const endpoint =
        userRole === "expert"
          ? `/chat/conversations/expert/${currentUserId}`
          : `/chat/conversations/${currentUserId}`;
      console.log("📡 Fetching:", endpoint);
      const res = await API.get(endpoint);
      const data = res?.data?.data || [];
      console.log("💬 Loaded:", data.length, "conversations");
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
      if (currentUserId && userRole) loadConversations();
    }, [currentUserId, userRole]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // ── Selection handlers ─────────────────────────────────────────────────
  const handleLongPress = (item) => {
    setSelectionMode(true);
    setSelectedItems([item.otherUserId]);
  };

  const handlePress = (item) => {
    if (selectionMode) {
      const newSelected = selectedItems.includes(item.otherUserId)
        ? selectedItems.filter((id) => id !== item.otherUserId)
        : [...selectedItems, item.otherUserId];
      setSelectedItems(newSelected);
      if (newSelected.length === 0) cancelSelection();
    } else {
      clearUnread(item.otherUserId);
      router.push({
        pathname: "/home/chatscreen",
        params: {
          expertId: item.otherUserId,
          name: item.name,
          avatar: item.avatar || "",
        },
      });
    }
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const confirmDelete = () => {
    setDeleteModal(true);
  };

  const handleDeleteForMe = async () => {
    setDeleteModal(false);
    await doDelete(false);
  };

  const handleDeleteForEveryone = async () => {
    setDeleteModal(false);
    await doDelete(true);
  };

  const doDelete = async (deleteForEveryone) => {
    try {
      await Promise.all(
        selectedItems.map((otherUserId) =>
          API.post("/chat/delete/conversation", {
            userId: currentUserId,
            otherUserId,
            deleteForEveryone,
          }).catch((e) => console.log("Delete error:", e.message)),
        ),
      );
      setChatData((prev) =>
        prev.filter((c) => !selectedItems.includes(c.otherUserId)),
      );
      cancelSelection();
    } catch (error) {
      console.log("Delete conversations error:", error.message);
    }
  };

  // ── Render chat item ───────────────────────────────────────────────────
  const renderChatItem = ({ item, index }) => {
    const avatarUri = getImageUri(item.avatar, item.name);
    const unread = unreadCounts[item.otherUserId] || 0;
    const timeStr = formatTime(item.lastMessageTime);
    const isSelected = selectedItems.includes(item.otherUserId);
    const initials = item.name
      ? item.name
          .trim()
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "US";
    const avatarBg = BG_CYCLE[index % BG_CYCLE.length];

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={400}
      >
        {/* Checkbox */}
        {selectionMode && (
          <View style={styles.checkboxWrap}>
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={WHITE} />
              )}
            </View>
          </View>
        )}

        {/* Avatar */}
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

        {/* Text */}
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
            {unread > 0 && !selectionMode && (
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
      {selectionMode ? (
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={cancelSelection}>
            <Ionicons name="close" size={22} color={TEAL_LIGHT} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {selectedItems.length} selected
            </Text>
          </View>
          <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={22} color={WHITE} />
          </Pressable>
        </View>
      ) : (
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
      )}

      {/* ── LIST ── */}
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
                {userRole === "expert"
                  ? "Users will appear here when they message you!"
                  : "Start chatting with an expert to get advice!"}
              </Text>
              {/* ✅ Only show for users NOT experts — goes to Search tab */}
              {userRole !== "expert" && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push("/expert/search")}
                >
                  <Text style={styles.emptyBtnText}>Find an Expert</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* ✅ Delete Modal — same style as chatscreen */}
      <DeleteConversationModal
        visible={deleteModal}
        count={selectedItems.length}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        onCancel={() => setDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: TEXT_2, fontWeight: "500" },

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
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DELETE_RED,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: PAGE_BG,
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 13, color: PAGE_BG, marginTop: 2, fontWeight: "500" },
  headerBadge: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: { fontSize: 12, fontWeight: "700", color: TEAL_TEXT },

  listContent: { paddingBottom: 30 },
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowSelected: { backgroundColor: SELECT_BG },

  checkboxWrap: { marginRight: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: WHITE,
  },
  checkboxSelected: { backgroundColor: TEAL, borderColor: TEAL },

  avatarWrap: { position: "relative", marginRight: 14 },
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
  avatarInitials: { color: WHITE, fontSize: 18, fontWeight: "800" },
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
    color: TEXT_1,
    flex: 1,
    marginRight: 8,
  },
  nameUnread: { fontWeight: "800" },
  date: { fontSize: 11, color: TEXT_2, fontWeight: "500" },
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
  lastMsgUnread: { fontWeight: "700", color: TEXT_1 },
  unreadBadge: {
    backgroundColor: TEAL,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontWeight: "800", color: WHITE },

  divider: { height: 0.5, backgroundColor: BORDER, marginLeft: 86 },

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
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: TEXT_1 },
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
  emptyBtnText: { color: WHITE, fontSize: 14, fontWeight: "800" },
});

// ── Modal styles (identical to chatscreen) ──────────────────────────────────
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
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_2,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
});

// ── ✅ FIX: dm StyleSheet was missing — caused "Property 'dm' doesn't exist" error ──
const dm = StyleSheet.create({
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DELETE_RED,
    marginBottom: 2,
  },
  optionSub: {
    fontSize: 12,
    color: TEXT_2,
  },
});