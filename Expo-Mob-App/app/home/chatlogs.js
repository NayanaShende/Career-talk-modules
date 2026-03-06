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
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://10.89.141.9:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

/* ---------------- DUMMY CALL DATA ---------------- */
const callData = [
  {
    id: "1",
    name: "Happy Tails Animal Rescue",
    status: "Outgoing",
    date: "Yesterday",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: "2",
    name: "City Critters Adoption Center",
    status: "Missed",
    date: "Sunday",
    avatar: "https://i.pravatar.cc/100?img=22",
  },
  {
    id: "3",
    name: "Purr Haven Shelter",
    status: "Outgoing",
    date: "Sunday",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
];

// ✅ Format time like WhatsApp
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
  const [activeTab, setActiveTab] = useState("Chats");
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  /* ---------- CALL ITEM ---------- */
  const renderCallItem = ({ item }) => (
    <View style={styles.row}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  /* ---------- CHAT ITEM - Real data ---------- */
  const renderChatItem = ({ item }) => {
    const avatarUri = item.avatar
      ? `${BASE_URL}/uploads/${item.avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0B2D72&color=fff`;

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          router.push({
            pathname: "/home/chatscreen",
            params: {
              expertId: item.otherUserId, // ✅ real userId for chat alignment
              name: item.name,
              avatar: item.avatar || "",
            },
          })
        }
      >
        {/* AVATAR with online dot */}
        <View>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.onlineDot} />
        </View>

        {/* NAME + LAST MESSAGE */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status} numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>

        {/* TIME */}
        <Text style={styles.date}>{formatTime(item.lastMessageTime)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.back}>←</Text>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.filter}>⚙️</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Chats" && styles.activeTab]}
          onPress={() => setActiveTab("Chats")}
        >
          <Text
            style={[styles.tabText, activeTab === "Chats" && styles.activeText]}
          >
            Chats {chatData.length > 0 ? `(${chatData.length})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Calls" && styles.activeTab]}
          onPress={() => setActiveTab("Calls")}
        >
          <Text
            style={[styles.tabText, activeTab === "Calls" && styles.activeText]}
          >
            Calls
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {activeTab === "Chats" && loading && chatData.length === 0 ? (
        <ActivityIndicator
          style={{ marginTop: 30 }}
          color="#0B2D72"
          size="large"
        />
      ) : (
        <FlatList
          data={activeTab === "Calls" ? callData : chatData}
          renderItem={activeTab === "Calls" ? renderCallItem : renderChatItem}
          keyExtractor={(item) => String(item.id || item.otherUserId)}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0B2D72"]}
            />
          }
          ListEmptyComponent={
            activeTab === "Chats" ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Text style={styles.emptySubText}>
                  Start chatting with an expert!
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
  },
  back: { fontSize: 20 },
  filter: { fontSize: 18 },
  title: { fontSize: 18, fontWeight: "600" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#e9e9e9",
    margin: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeTab: { backgroundColor: "#0B2D72" },
  tabText: { color: "#444", fontWeight: "500" },
  activeText: { color: "#fff", fontWeight: "600" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#25D366",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 15, fontWeight: "600", color: "#111" },
  status: { color: "#777", marginTop: 2, fontSize: 13 },
  date: { color: "#999", fontSize: 12, marginLeft: 8 },
  divider: { height: 1, backgroundColor: "#eee", marginLeft: 77 },

  emptyWrap: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#333" },
  emptySubText: { fontSize: 14, color: "#999", marginTop: 4 },
});
