import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  RTCView,
} from "@livekit/react-native-webrtc";
import axios from "axios";
import { io } from "socket.io-client";
import { InCallManager } from "react-native-incall-manager";

const BASE_URL = "http://10.235.241.9:3000";
const API = axios.create({ baseURL: `${BASE_URL}/api`, timeout: 10000 });
const TEAL = "#867795";
const WHITE = "#FFFFFF";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
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
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=867795&color=fff`;
};

export default function InCallScreen() {
  const router = useRouter();
  const {
    callId,
    callerId,
    receiverId,
    expertName,
    expertImage,
    callType,
    isCaller,
    callerName: paramCallerName,
    callerImage: paramCallerImage,
  } = useLocalSearchParams();

  const IS_CALLER = isCaller === "true";
  const IS_VIDEO = callType === "video";

  const [seconds, setSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const pcRef = useRef(null);
  const tickRef = useRef(null);
  const timerRef = useRef(null);
  const minutesRef = useRef(0);
  const cleanedUp = useRef(false);
  const socketRef = useRef(null);
  const offerSentRef = useRef(false);
  const pendingCallerCandidates = useRef([]);
  const pendingReceiverCandidates = useRef([]);
  const remoteDescSet = useRef(false);

  // ✅ Resolve display name:
  // - Caller sees expert name (passed as expertName)
  // - Receiver sees the caller's real name (passed as callerName from incomingcall.js)
  const displayName = (() => {
    if (IS_CALLER) {
      const n = expertName;
      return n && n !== "undefined" && n !== "null" && n.trim() !== ""
        ? n
        : "Expert";
    } else {
      const n = paramCallerName || expertName;
      return n && n !== "undefined" && n !== "null" && n.trim() !== ""
        ? n
        : "User";
    }
  })();

  const displayImage = IS_CALLER
    ? expertImage
    : paramCallerImage &&
        paramCallerImage !== "undefined" &&
        paramCallerImage !== "null"
      ? paramCallerImage
      : expertImage;

  useEffect(() => {
    activateKeepAwakeAsync().catch(() => {});
    return () => deactivateKeepAwake();
  }, []);

  useEffect(() => {
    try {
      InCallManager.start({ media: IS_VIDEO ? "video" : "audio" });
      InCallManager.setForceSpeakerphoneOn(IS_VIDEO);
    } catch (e) {
      console.log("InCallManager start error:", e.message);
    }
    return () => {
      try {
        InCallManager.stop();
      } catch (e) {
        console.log("InCallManager stop error:", e.message);
      }
    };
  }, []);

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
    if (!currentUserId) return;
    initCall();
    return () => cleanup();
  }, [currentUserId]);

  const initCall = () => {
    const socket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: false,
    });
    socketRef.current = socket;

    socket.on("connect", async () => {
      console.log("🟢 InCall socket connected:", socket.id);
      socket.emit("joinRoom", { userId: currentUserId });
      await new Promise((r) => setTimeout(r, 500));
      await setupWebRTC(socket);
    });

    socket.on("call-ended", ({ callId: cId }) => {
      if (String(cId) !== String(callId)) return;
      handleEndCall(false);
    });

    socket.on("disconnect", (reason) =>
      console.log("🔴 InCall socket disconnected:", reason),
    );
  };

  const setupWebRTC = async (socket) => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: IS_VIDEO ? { facingMode: "user" } : false,
      });
      setLocalStream(stream);
      console.log("🎤 Got local stream");

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams?.[0]) {
          console.log("🎵 Remote stream received!");
          setRemoteStream(event.streams[0]);
          setCallStatus("active");
          startTimer();
          if (IS_CALLER) startBillingTick();
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const targetUserId = IS_CALLER ? receiverId : callerId;
          socket.emit("webrtc-ice-candidate", {
            callId,
            targetUserId,
            candidate: event.candidate,
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE state:", pc.iceConnectionState);
        if (
          pc.iceConnectionState === "connected" ||
          pc.iceConnectionState === "completed"
        ) {
          setCallStatus("active");
          startTimer();
          if (IS_CALLER) startBillingTick();
        }
        if (pc.iceConnectionState === "failed") handleEndCall(false);
      };

      const flushIceCandidates = async () => {
        const queue = IS_CALLER
          ? pendingCallerCandidates.current
          : pendingReceiverCandidates.current;
        console.log(`🧊 Flushing ${queue.length} queued ICE candidates`);
        for (const candidate of queue) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.log("ICE flush error:", e.message);
          }
        }
        if (IS_CALLER) pendingCallerCandidates.current = [];
        else pendingReceiverCandidates.current = [];
      };

      socket.on("webrtc-ice-candidate", async ({ callId: cId, candidate }) => {
        if (String(cId) !== String(callId)) return;
        if (!remoteDescSet.current || !pcRef.current) {
          if (IS_CALLER) pendingCallerCandidates.current.push(candidate);
          else pendingReceiverCandidates.current.push(candidate);
          console.log("⏳ ICE candidate queued");
          return;
        }
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.log("ICE add error:", e.message);
        }
      });

      socket.on("webrtc-offer", async ({ callId: cId, sdp }) => {
        if (String(cId) !== String(callId)) return;
        console.log("📨 Received WebRTC offer");
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          remoteDescSet.current = true;
          await flushIceCandidates();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { callId, callerId, sdp: answer });
          console.log("📤 Answer sent to caller");
        } catch (e) {
          console.log("❌ Offer handling error:", e.message);
        }
      });

      socket.on("webrtc-answer", async ({ callId: cId, sdp }) => {
        if (String(cId) !== String(callId)) return;
        console.log("📨 Received WebRTC answer");
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          remoteDescSet.current = true;
          await flushIceCandidates();
        } catch (e) {
          console.log("❌ Answer handling error:", e.message);
        }
      });

      socket.on("webrtc-media-state", ({ isMuted: m, isCameraOff: c }) => {
        console.log("Remote media state:", { muted: m, cameraOff: c });
      });

      // RECEIVER FLOW
      if (!IS_CALLER) {
        try {
          await API.post("/calls/accept", { callId: Number(callId) });
          console.log("✅ Call accepted on backend");
        } catch (e) {
          console.log("acceptCall error:", e.message);
        }
        socket.emit("receiver-ready", { callId, callerId });
        console.log("📣 Emitted receiver-ready to caller:", callerId);
      }

      // CALLER FLOW
      if (IS_CALLER) {
        socket.on("receiver-ready", async ({ callId: cId }) => {
          if (String(cId) !== String(callId) || offerSentRef.current) return;
          offerSentRef.current = true;
          console.log("📣 Receiver ready! Sending offer...");
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: IS_VIDEO,
            });
            await pc.setLocalDescription(offer);
            socket.emit("webrtc-offer", { callId, receiverId, sdp: offer });
            console.log("📡 Offer sent to receiver:", receiverId);
          } catch (e) {
            console.log("❌ createOffer error:", e.message);
          }
        });

        // Fallback after 8s
        setTimeout(async () => {
          if (offerSentRef.current || cleanedUp.current) return;
          offerSentRef.current = true;
          console.log("⏱️ Fallback: sending offer after 8s");
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: IS_VIDEO,
            });
            await pc.setLocalDescription(offer);
            socket.emit("webrtc-offer", { callId, receiverId, sdp: offer });
          } catch (e) {
            console.log("❌ Fallback offer error:", e.message);
          }
        }, 8000);
      }
    } catch (err) {
      console.error("❌ setupWebRTC error:", err.message);
      Alert.alert("Call Error", err.message);
      router.replace("/");
    }
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setSeconds((p) => p + 1), 1000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ✅ Billing tick — only runs on CALLER side
  const startBillingTick = () => {
    if (tickRef.current) return;
    tickRef.current = setInterval(async () => {
      try {
        const res = await API.post("/calls/tick", {
          callId: Number(callId),
          caller_id: currentUserId,
        });
        if (res.data.success) {
          minutesRef.current += 1;
          setMinutesUsed(minutesRef.current);
          setWalletBalance(res.data.balance);
          console.log(
            `💸 Tick ${minutesRef.current} min — balance: ₹${res.data.balance}`,
          );
        }
      } catch (e) {
        console.log("Tick error:", e?.response?.data || e.message);
        if (e?.response?.data?.error === "insufficient_balance") {
          Alert.alert("Low Balance", "Your balance is low. Call will end.");
          handleEndCall(true);
        }
      }
    }, 60000);
  };

  const handleEndCall = async (autoEnded = false) => {
    if (cleanedUp.current) return;
    cleanedUp.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);

    socketRef.current?.emit("end-call", { callId, callerId, receiverId });
    localStream?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();

    try {
      if (IS_CALLER) {
        // ✅ CALLER sends caller_id + minutesUsed → triggers wallet release
        await API.post("/calls/end", {
          callId: Number(callId),
          caller_id: currentUserId,
          minutesUsed: minutesRef.current,
        });
        console.log(`✅ Call ended (caller) — ${minutesRef.current} min used`);
      } else {
        // ✅ RECEIVER sends only callId — no wallet ops on backend
        await API.post("/calls/end", {
          callId: Number(callId),
          // intentionally NO caller_id here
        });
        console.log("✅ Call ended (receiver)");
      }
    } catch (e) {
      console.log("endCall API error:", e.message);
    }

    router.replace("/");
  };

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    socketRef.current?.emit("webrtc-media-state", {
      callId,
      targetUserId: IS_CALLER ? receiverId : callerId,
      isMuted: newMuted,
      isCameraOff,
    });
  };

  const toggleSpeaker = () => {
    const newSpeaker = !isSpeaker;
    setIsSpeaker(newSpeaker);
    try {
      InCallManager.setForceSpeakerphoneOn(newSpeaker);
    } catch (e) {
      console.log("Speaker toggle error:", e.message);
    }
  };

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    const newCameraOff = !isCameraOff;
    setIsCameraOff(newCameraOff);
    socketRef.current?.emit("webrtc-media-state", {
      callId,
      targetUserId: IS_CALLER ? receiverId : callerId,
      isMuted,
      isCameraOff: newCameraOff,
    });
  };

  const cleanup = () => {
    if (cleanedUp.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    localStream?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar backgroundColor="#1a1a2e" barStyle="light-content" />

      {IS_VIDEO && (
        <>
          {remoteStream ? (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={s.remoteVideo}
              objectFit="cover"
            />
          ) : (
            <View style={s.centerSection}>
              <Image
                source={{ uri: getImageUri(displayImage, displayName) }}
                style={s.avatar}
              />
              <Text style={s.expertName}>{displayName}</Text>
              <Text style={s.statusTxt}>Connecting...</Text>
            </View>
          )}
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={s.localVideo}
              objectFit="cover"
              mirror
            />
          )}
        </>
      )}

      {!IS_VIDEO && (
        <View style={s.centerSection}>
          <Image
            source={{ uri: getImageUri(displayImage, displayName) }}
            style={s.avatar}
          />
          <Text style={s.expertName}>{displayName}</Text>
          <Text style={s.statusTxt}>
            {callStatus === "active" ? formatTime(seconds) : "Connecting..."}
          </Text>
        </View>
      )}

      {/* ✅ Billing bar — shows real-time deduction info to CALLER only */}
      {IS_CALLER && callStatus === "active" && (
        <View style={s.billingBar}>
          <Text style={s.billingTxt}>⏱️ {minutesUsed} min · ₹10/min</Text>
          <Text style={s.balanceTxt}>₹{walletBalance.toFixed(2)}</Text>
        </View>
      )}

      {IS_VIDEO && callStatus === "active" && (
        <View style={s.timerBadge}>
          <Text style={s.timerBadgeTxt}>{formatTime(seconds)}</Text>
        </View>
      )}

      <View style={s.controlsRow}>
        <TouchableOpacity
          style={[s.ctrlBtn, isMuted && s.ctrlBtnActive]}
          onPress={toggleMute}
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={24}
            color={isMuted ? "#1a1a2e" : WHITE}
          />
          <Text style={[s.ctrlLabel, isMuted && { color: "#1a1a2e" }]}>
            {isMuted ? "Unmute" : "Mute"}
          </Text>
        </TouchableOpacity>

        {!IS_VIDEO && (
          <TouchableOpacity
            style={[s.ctrlBtn, isSpeaker && s.ctrlBtnActive]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeaker ? "volume-high" : "volume-medium"}
              size={24}
              color={isSpeaker ? "#1a1a2e" : WHITE}
            />
            <Text style={[s.ctrlLabel, isSpeaker && { color: "#1a1a2e" }]}>
              Speaker
            </Text>
          </TouchableOpacity>
        )}

        {IS_VIDEO && (
          <TouchableOpacity
            style={[s.ctrlBtn, isCameraOff && s.ctrlBtnActive]}
            onPress={toggleCamera}
          >
            <Ionicons
              name={isCameraOff ? "videocam-off" : "videocam"}
              size={24}
              color={isCameraOff ? "#1a1a2e" : WHITE}
            />
            <Text style={[s.ctrlLabel, isCameraOff && { color: "#1a1a2e" }]}>
              Camera
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[s.ctrlBtn, s.endBtn]}
          onPress={() => handleEndCall(false)}
        >
          <Ionicons name="call" size={26} color={WHITE} />
          <Text style={[s.ctrlLabel, { color: WHITE }]}>End</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  remoteVideo: { ...StyleSheet.absoluteFillObject },
  localVideo: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 110,
    height: 155,
    borderRadius: 14,
    zIndex: 10,
    borderWidth: 2,
    borderColor: WHITE,
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: TEAL,
    marginBottom: 4,
  },
  expertName: {
    fontSize: 24,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.3,
  },
  statusTxt: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  billingBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  billingTxt: { color: WHITE, fontWeight: "700", fontSize: 13 },
  balanceTxt: { color: "#4ADE80", fontWeight: "800", fontSize: 14 },
  timerBadge: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timerBadgeTxt: { color: WHITE, fontWeight: "700", fontSize: 13 },
  controlsRow: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 24,
  },
  ctrlBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.15)",
    gap: 4,
  },
  ctrlBtnActive: { backgroundColor: WHITE },
  ctrlLabel: { fontSize: 10, color: WHITE, fontWeight: "600" },
  endBtn: {
    backgroundColor: "#ef4444",
    width: 72,
    height: 72,
    borderRadius: 36,
  },
});
