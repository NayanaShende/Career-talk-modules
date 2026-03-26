import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import socket from "../services/socket";
import { acceptCall, rejectCall } from "../services/callService";

export default function IncomingCall() {
  const router = useRouter(); // ✅ YOU MISSED THIS
  const { callId, callerId } = useLocalSearchParams();

  const loggedInUserId = 1; // ⚠️ replace with real logged-in user id

  useEffect(() => {
    socket.on("call-ended", () => {
      router.replace("/");
    });

    return () => {
      socket.off("call-ended");
    };
  }, []);

  // ✅ ACCEPT CALL
  const handleAccept = async () => {
    try {
      await acceptCall(callId);

      // 🔥 IMPORTANT: Emit socket event
      socket.emit("accept-call", {
        callId,
        callerId,
        receiverId: loggedInUserId,
      });

      router.replace({
        pathname: "/incall",
        params: {
          callId,
          callerId,
          receiverId: loggedInUserId,
        },
      });
    } catch (error) {
      console.log("Accept error:", error.response?.data || error.message);
    }
  };

  // ✅ REJECT CALL
  const handleReject = async () => {
    try {
      await rejectCall(callId);

      socket.emit("reject-call", {
        callId,
        callerId,
      });

      router.back();
    } catch (error) {
      console.log("Reject error:", error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Call</Text>
      <Text style={styles.sub}>User {callerId} is calling...</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.accept} onPress={handleAccept}>
          <Text style={styles.text}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reject} onPress={handleReject}>
          <Text style={styles.text}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "white",
    marginBottom: 10,
  },
  sub: {
    fontSize: 18,
    color: "lightgray",
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 30,
  },
  accept: {
    backgroundColor: "green",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  reject: {
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  text: {
    color: "white",
    fontSize: 18,
  },
});
