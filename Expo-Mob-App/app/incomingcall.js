import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, StatusBar, Vibration, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { BASE_URL } from "../constants/config";
import { useNotification } from "../context/NotificationContext";

const TEAL  = "#867795";
const WHITE = "#FFFFFF";

const getImageUri = (image, name) => {
  if (image && image !== "undefined" && image !== "null" && image.trim() !== "") {
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return `${BASE_URL}/uploads/${image.replace(/^uploads\//, "")}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=867795&color=fff`;
};

const normaliseCallType = (raw) => {
  if (!raw || raw === "undefined" || raw === "null") return "audio";
  const s = raw.trim().toLowerCase();
  if (s === "video") return "video";
  return "audio";
};

export default function IncomingCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ Read from NotificationContext to get live-updated callType
  const { getLatestCallType, markCallScreenOpen, markCallScreenClosed } =
    useNotification();

  const callId      = params.callId      || null;
  const callerId    = params.callerId    || null;
  const callerName  = params.callerName  || "User";
  const callerImage = params.callerImage || "";

  // ✅ callType as STATE — initialised from params, can be updated
  const [callType, setCallType] = useState(() =>
    normaliseCallType(params.callType)
  );
  const callTypeRef = useRef(normaliseCallType(params.callType));

  const [accepting,     setAccepting]     = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [callActive,    setCallActive]    = useState(true);

  const currentUserIdRef = useRef(null);
  const socketRef        = useRef(null);

  // ✅ Derived from state
  const IS_VIDEO = callType === "video";

  // ── On mount: mark screen open, start polling context for callType updates
  useEffect(() => {
    if (callerId) {
      markCallScreenOpen(callerId);

      // ✅ Poll context every 300ms for up to 3s to catch the second incoming-call event
      // The second event (call-invite relay) arrives ~100-500ms after first
      let attempts = 0;
      const maxAttempts = 10; // 10 × 300ms = 3s
      const pollInterval = setInterval(() => {
        attempts++;
        const latest = getLatestCallType(callerId);
        if (latest !== callTypeRef.current) {
          console.log(
            `🔄 callType updated from context: ${callTypeRef.current} → ${latest}`
          );
          callTypeRef.current = latest;
          setCallType(latest);
          clearInterval(pollInterval); // stop once we get an update
          return;
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }, 300);

      return () => {
        clearInterval(pollInterval);
        markCallScreenClosed(callerId);
      };
    }
  }, [callerId]);

  // ── Load current user
  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u   = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        setCurrentUserId(Number(uid));
        currentUserIdRef.current = Number(uid);
      }
    });
  }, []);

  // ── Vibrate on mount
  useEffect(() => {
    Vibration.vibrate([500, 1000, 500, 1000], true);
    return () => Vibration.cancel();
  }, []);

  // ── Socket: listen for call-cancelled / call-ended
  useEffect(() => {
    if (!callId) return;

    socketRef.current = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      const myId = currentUserIdRef.current;
      if (myId) {
        socketRef.current.emit("joinRoom", { userId: myId });
        console.log(`📲 IncomingCall: joined room for userId ${myId}`);
      }
    });

    socketRef.current.on("call-cancelled", (data) => {
      if (String(data.callId) === String(callId)) {
        console.log("🚫 Caller cancelled the call");
        Vibration.cancel();
        setCallActive(false);
        Alert.alert("Call Ended", "The caller cancelled the call.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    });

    socketRef.current.on("call-ended", (data) => {
      if (String(data.callId) === String(callId)) {
        console.log("🔚 Call ended");
        Vibration.cancel();
        setCallActive(false);
        router.back();
      }
    });

    socketRef.current.on("call:cancelled", (data) => {
      if (String(data.callId) === String(callId)) {
        Vibration.cancel();
        setCallActive(false);
        router.back();
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [callId]);

  // ── Re-join room when currentUserId loads after socket connect
  useEffect(() => {
    if (currentUserId && socketRef.current?.connected) {
      socketRef.current.emit("joinRoom", { userId: currentUserId });
    }
  }, [currentUserId]);

  // ── Accept call
  const handleAccept = () => {
    if (accepting || !currentUserId || !callId || !callActive) return;
    setAccepting(true);
    Vibration.cancel();

    // ✅ Read LATEST callType from context at the moment of Accept press
    // This guarantees we always use the most up-to-date value
    const contextCallType = getLatestCallType(callerId);
    const finalCallType =
      contextCallType !== "audio" || callTypeRef.current === "video"
        ? contextCallType
        : callTypeRef.current;
    const finalIsVideo = finalCallType === "video";

    console.log(
      `✅ Accepting: callId=${callId} callerId=${callerId} ` +
      `receiverId=${currentUserId} callType=${finalCallType} IS_VIDEO=${finalIsVideo}`
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit("call-accepted", {
        callId,
        callerId:   Number(callerId),
        receiverId: currentUserId,
        roomId:     callId,
      });
    }

    router.replace({
      pathname: "/incall",
      params: {
        callId:      String(callId),
        callerId:    String(callerId),
        receiverId:  String(currentUserId),
        expertName:  callerName,
        expertImage: callerImage,
        callType:    finalCallType,   // ✅ "audio" or "video" — from context
        isCaller:    "false",
        callerName:  callerName,
      },
    });
  };

  // ── Reject call
  const handleReject = () => {
    Vibration.cancel();
    console.log(`❌ Rejecting call: callId=${callId} callerId=${callerId}`);
    if (socketRef.current?.connected) {
      socketRef.current.emit("call-rejected", {
        callId,
        callerId:   Number(callerId),
        receiverId: currentUserId,
        roomId:     callId,
      });
    }
    router.back();
  };

  if (!callId) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <StatusBar backgroundColor="#1a1a2e" barStyle="light-content" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: WHITE, fontSize: 16 }}>Waiting for call...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar backgroundColor="#1a1a2e" barStyle="light-content" />

      <View style={s.callerSection}>
        <Text style={s.incomingLabel}>
          INCOMING {IS_VIDEO ? "VIDEO" : "VOICE"} CALL
        </Text>

        <Image
          source={{ uri: getImageUri(callerImage, callerName) }}
          style={s.callerAvatar}
        />

        <Text style={s.callerName}>
          {callerName && callerName !== "User" ? callerName : `User ${callerId}`}
        </Text>

        <View style={s.callTypeBadge}>
          <Ionicons name={IS_VIDEO ? "videocam" : "call"} size={14} color={TEAL} />
          <Text style={s.callTypeTxt}>{IS_VIDEO ? "Video Call" : "Voice Call"}</Text>
        </View>

        <Text style={s.connectingTxt}>
          {callActive ? "Tap Accept to answer..." : "Call ended"}
        </Text>
      </View>

      <View style={s.actionsRow}>
        <View style={s.btnWrap}>
          <TouchableOpacity
            style={[s.actionBtn, s.rejectBtn]}
            onPress={handleReject}
            disabled={accepting}
          >
            <Ionicons
              name="call" size={32} color={WHITE}
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </TouchableOpacity>
          <Text style={s.btnLabel}>Decline</Text>
        </View>

        <View style={s.btnWrap}>
          <TouchableOpacity
            style={[s.actionBtn, s.acceptBtn, (accepting || !callActive) && { opacity: 0.5 }]}
            onPress={handleAccept}
            disabled={accepting || !callActive}
          >
            <Ionicons name="call" size={32} color={WHITE} />
          </TouchableOpacity>
          <Text style={s.btnLabel}>{accepting ? "Connecting..." : "Accept"}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#1a1a2e",
    alignItems: "center", justifyContent: "space-between", paddingVertical: 60,
  },
  callerSection: { alignItems: "center", gap: 16 },
  incomingLabel: {
    fontSize: 14, color: "rgba(255,255,255,0.6)",
    fontWeight: "600", letterSpacing: 1,
  },
  callerAvatar: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 3, borderColor: TEAL, marginVertical: 8,
  },
  callerName: { fontSize: 28, fontWeight: "800", color: WHITE, letterSpacing: -0.3 },
  callTypeBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(134,119,149,0.2)",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  callTypeTxt:   { color: TEAL, fontWeight: "700", fontSize: 13 },
  connectingTxt: {
    fontSize: 13, color: "rgba(255,255,255,0.5)",
    fontWeight: "500", marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row", justifyContent: "center",
    gap: 80, width: "100%",
  },
  btnWrap:   { alignItems: "center", gap: 10 },
  actionBtn: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: "center", alignItems: "center",
  },
  rejectBtn: { backgroundColor: "#ef4444" },
  acceptBtn: { backgroundColor: "#22c55e" },
  btnLabel:  { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
});