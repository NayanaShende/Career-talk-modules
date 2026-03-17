import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function InCallScreen() {
  const router = useRouter();
  const { callId, callerId, receiverId } = useLocalSearchParams();

  const [seconds, setSeconds] = useState(0);

  // Call timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for call end
  useEffect(() => {
    socket.on("call-ended", () => {
      router.replace("/");
    });

    return () => {
      socket.off("call-ended");
    };
  }, []);

  const handleEndCall = () => {
    socket.emit("end-call", {
      callId,
      callerId,
      receiverId,
    });

    router.replace("/");
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>Voice Call</Text>
      <Text style={styles.timer}>{formatTime()}</Text>

      <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
        <Text style={styles.endText}>End Call</Text>
      </TouchableOpacity>
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
  name: {
    fontSize: 26,
    color: "white",
    marginBottom: 10,
  },
  timer: {
    fontSize: 20,
    color: "lightgray",
    marginBottom: 40,
  },
  endButton: {
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  endText: {
    color: "white",
    fontSize: 18,
  },
});