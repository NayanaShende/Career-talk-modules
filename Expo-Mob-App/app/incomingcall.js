import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "../services/socket";
import { acceptCall, rejectCall } from "../services/callService";

const TEAL = "#867795";
const WHITE = "#FFFFFF";

const getImageUri = (image, name) => {
  if (
    image &&
    image !== "undefined" &&
    image !== "null" &&
    image.trim() !== ""
  ) {
    if (image.startsWith("http://") || image.startsWith("https://"))
      return image;
    return `http://10.235.241.9:3000/uploads/${image.replace(/^uploads\//, "")}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=867795&color=fff`;
};

export default function IncomingCall() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [callData, setCallData] = useState({
    callId: params.callId || null,
    callerId: params.callerId || null,
    callerName: params.callerName || null,
    callerImage: params.callerImage || null,
    callType: params.callType || "voice",
  });

  const IS_VIDEO = callData.callType === "video";
  const [accepting, setAccepting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (str) {
        const u = JSON.parse(str);
        const uid = u?.id || u?.userId || u?.user?.id;
        setCurrentUserId(Number(uid));
      }
    });
  }, []);

  useEffect(() => {
    Vibration.vibrate([500, 1000, 500, 1000], true);
    return () => Vibration.cancel();
  }, []);

  useEffect(() => {
    // ✅ Update call data if new incoming-call arrives on this screen
    socket.on("incoming-call", (data) => {
      console.log(
        "📲 incoming-call socket received on IncomingCall screen:",
        data,
      );
      setCallData({
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerImage: data.callerImage,
        callType: data.callType || "voice",
      });
    });

    socket.on("call-ended", ({ callId: cId }) => {
      if (String(cId) === String(callData.callId)) {
        Vibration.cancel();
        router.replace("/");
      }
    });

    socket.on("call:cancelled", ({ callId: cId }) => {
      if (String(cId) === String(callData.callId)) {
        Vibration.cancel();
        router.replace("/");
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-ended");
      socket.off("call:cancelled");
    };
  }, [callData.callId]);

  // ── Accept ────────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (accepting || !currentUserId || !callData.callId) return;
    setAccepting(true);
    Vibration.cancel();

    try {
      // NOTE: Do NOT call acceptCall API here — incall.js handles it
      // Just emit socket so caller knows expert accepted
      socket.emit("accept-call", {
        callId: callData.callId,
        callerId: callData.callerId,
        receiverId: currentUserId,
      });

      // ✅ Navigate to incall as RECEIVER, passing callerName so incall shows real name
      router.replace({
        pathname: "/incall",
        params: {
          callId: String(callData.callId),
          callerId: String(callData.callerId),
          receiverId: String(currentUserId),
          // ✅ FIX: expertName on receiver side = the caller's name
          expertName: callData.callerName || "User",
          expertImage: callData.callerImage || "",
          callType: callData.callType || "voice",
          isCaller: "false",
          // ✅ Also pass callerName explicitly
          callerName: callData.callerName || "User",
        },
      });
    } catch (error) {
      console.log("Accept error:", error.response?.data || error.message);
      setAccepting(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────
  const handleReject = async () => {
    Vibration.cancel();
    try {
      await rejectCall(callData.callId);
      socket.emit("reject-call", {
        callId: callData.callId,
        callerId: callData.callerId,
      });
    } catch (error) {
      console.log("Reject error:", error.response?.data || error.message);
    }
    router.back();
  };

  if (!callData.callId) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <StatusBar backgroundColor="#1a1a2e" barStyle="light-content" />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: WHITE, fontSize: 16 }}>
            Waiting for call...
          </Text>
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
          source={{
            uri: getImageUri(callData.callerImage, callData.callerName),
          }}
          style={s.callerAvatar}
        />

        {/* ✅ FIX: Show real caller name — not hardcoded "User" */}
        <Text style={s.callerName}>
          {callData.callerName && callData.callerName !== "User"
            ? callData.callerName
            : `User ${callData.callerId}`}
        </Text>

        <View style={s.callTypeBadge}>
          <Ionicons
            name={IS_VIDEO ? "videocam" : "call"}
            size={14}
            color={TEAL}
          />
          <Text style={s.callTypeTxt}>
            {IS_VIDEO ? "Video Call" : "Voice Call"}
          </Text>
        </View>
      </View>

      <View style={s.actionsRow}>
        <View style={s.btnWrap}>
          <TouchableOpacity
            style={[s.actionBtn, s.rejectBtn]}
            onPress={handleReject}
          >
            <Ionicons
              name="call"
              size={32}
              color={WHITE}
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </TouchableOpacity>
          <Text style={s.btnLabel}>Decline</Text>
        </View>

        <View style={s.btnWrap}>
          <TouchableOpacity
            style={[s.actionBtn, s.acceptBtn, accepting && { opacity: 0.7 }]}
            onPress={handleAccept}
            disabled={accepting}
          >
            <Ionicons name="call" size={32} color={WHITE} />
          </TouchableOpacity>
          <Text style={s.btnLabel}>Accept</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  callerSection: { alignItems: "center", gap: 16 },
  incomingLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    letterSpacing: 1,
  },
  callerAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: TEAL,
    marginVertical: 8,
  },
  callerName: {
    fontSize: 28,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.3,
  },
  callTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(134,119,149,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callTypeTxt: { color: TEAL, fontWeight: "700", fontSize: 13 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 80,
    width: "100%",
  },
  btnWrap: { alignItems: "center", gap: 10 },
  actionBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtn: { backgroundColor: "#ef4444" },
  acceptBtn: { backgroundColor: "#22C55E" },
  btnLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
});
