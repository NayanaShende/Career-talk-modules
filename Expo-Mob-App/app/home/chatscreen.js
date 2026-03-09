import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const BASE_URL = "http://192.168.1.22:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });

const sortMessages = (msgs) =>
  [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

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

export default function ChatScreen() {
  const { expertId, name, avatar } = useLocalSearchParams();
  const RECEIVER_ID = Number(expertId);

  const expertName =
    name && name !== "undefined" && name !== "null" ? name : "Expert";

  const expertAvatarUrl =
    avatar && avatar !== "undefined" && avatar !== "null" && avatar !== ""
      ? `${BASE_URL}/uploads/${avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          expertName,
        )}&background=0B2D72&color=fff`;

  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // 🔥 free chat timer state
  const [freeChatEnded, setFreeChatEnded] = useState(false);

  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // get user
  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        setCurrentUserId(Number(uid));
      }
    });
  }, []);

  // 🔥 start free chat timer (60 sec)
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setFreeChatEnded(true);

      Alert.alert(
        "Free Chat Ended",
        "Your free 1 minute chat is over. Please recharge your wallet to continue chatting with the expert.",
        [
          {
            text: "Go to Wallet",
            onPress: () => router.push("/home/WalletModal"),
          },
        ],
      );
    }, 60000);

    return () => clearTimeout(timerRef.current);
  }, []);

  const loadChats = async () => {
    if (!RECEIVER_ID || !currentUserId) return;

    try {
      setLoading(true);

      const res = await API.get(
        `/chat/messages/${currentUserId}/${RECEIVER_ID}`,
      );

      setMessages(sortMessages(res?.data?.data || []));
    } catch (error) {
      console.log("Load chat error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (freeChatEnded) {
      Alert.alert(
        "Recharge Required",
        "Your free chat has ended. Please recharge wallet to continue.",
        [{ text: "Go to Wallet", onPress: () => router.push("/home/WalletModal") }],
      );
      return;
    }

    if (!textMessage.trim() || !RECEIVER_ID || !currentUserId) return;

    const messageToSend = textMessage;
    setTextMessage("");

    const tempId = `temp_${Date.now()}`;

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
    }
  };

  useEffect(() => {
    if (!currentUserId || !RECEIVER_ID) return;

    loadChats();

    socketRef.current = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      setIsOnline(true);
      socketRef.current.emit("joinRoom", { userId: currentUserId });
    });

    socketRef.current.on("disconnect", () => setIsOnline(false));

    socketRef.current.on("receiveMessage", (newMessage) => {
      if (Number(newMessage.sender_id) !== Number(currentUserId)) {
        setMessages((prev) => sortMessages([...prev, newMessage]));

        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, RECEIVER_ID]);

  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateSepWrap}>
          <Text style={styles.dateSepText}>{item.label}</Text>
        </View>
      );
    }

    const isUser = Number(item.sender_id) === Number(currentUserId);

    return (
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        {!isUser && (
          <Image source={{ uri: expertAvatarUrl }} style={styles.msgAvatar} />
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              styles.msgText,
              isUser ? styles.msgTextMine : styles.msgTextTheirs,
            ]}
          >
            {item.message}
          </Text>

          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                isUser ? styles.timeMine : styles.timeTheirs,
              ]}
            >
              {formatTime(item.created_at)}
            </Text>

            {isUser && <Text style={styles.ticks}> ✓✓</Text>}
          </View>
        </View>

        {!isUser && <View style={{ width: 48 }} />}
      </View>
    );
  };

  if (!currentUserId) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4A6CF7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Image source={{ uri: expertAvatarUrl }} style={styles.headerAvatar} />

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{expertName}</Text>
          <Text
            style={[
              styles.headerStatus,
              { color: isOnline ? "#34C759" : "#8E8E93" },
            ]}
          >
            {isOnline ? "Active now" : "Offline"}
          </Text>
        </View>
      </View>

      <View style={styles.chatBg}>
        <FlatList
          ref={flatListRef}
          data={groupByDate(messages)}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* INPUT */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Message..."
            style={styles.input}
            value={textMessage}
            onChangeText={setTextMessage}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
});
