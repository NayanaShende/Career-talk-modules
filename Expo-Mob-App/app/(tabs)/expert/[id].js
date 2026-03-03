import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions,
  StatusBar,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpertById } from "../../../services/expertService";
import { initiateCall } from "../../../services/callService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");
const BASE_URL = "http://10.89.141.9:3000";

function StarRating({ rating, size = 20 }) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={size}
          color="#FBBF24"
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}

function RatingModal({ visible, onClose, onSubmit }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      Alert.alert("Please select a rating");
      return;
    }
    setSubmitting(true);
    await onSubmit(selectedRating);
    setSubmitting(false);
    setSelectedRating(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Rate this Expert</Text>
          <View style={styles.starSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setSelectedRating(star)}>
                <Ionicons
                  name={star <= selectedRating ? "star" : "star-outline"}
                  size={40}
                  color="#FBBF24"
                  style={{ marginHorizontal: 6 }}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitRatingBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitRatingBtnText}>
                {submitting ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ExpertProfile() {
  const { id } = useLocalSearchParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchExpert();
    fetchRatings();
  }, [id]);

  const fetchExpert = async () => {
    try {
      const res = await getExpertById(id);
      setExpert(res?.data || res);
    } catch (err) {
      console.log("Profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/experts/${id}/ratings`);
      if (res.data?.success) {
        setRatingData({
          avgRating: res.data.data.avgRating || 0,
          totalReviews: res.data.data.totalReviews || 0,
        });
      }
    } catch (err) {
      console.log("Fetch ratings error:", err.message);
    }
  };

  const handleSubmitRating = async (rating) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/experts/${id}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert("Thank you!", "Your rating has been submitted.");
      fetchRatings();
    } catch (err) {
      Alert.alert("Error", "Could not submit rating.");
    }
  };

  const handleChatPress = () => {
    router.push({
      pathname: "/home/chatscreen",
      params: {
        expertId: id,
        name: expert.name,
        avatar: expert.image,
      },
    });
  };

  // ✅ NEW CALL FUNCTION
  const handleCallPress = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await initiateCall(id, token);

      if (res?.success || res?.data?.success) {
        const callId = res?.data?.callId || res?.callId;

        router.push({
          pathname: "/incomingcall",
          params: { callId },
        });
      } else {
        Alert.alert("Error", "Unable to initiate call");
      }
    } catch (error) {
      console.log("Call error:", error);
      Alert.alert("Error", "Call failed. Check backend.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0B2D72" />
      </View>
    );
  }

  if (!expert) {
    return (
      <View style={styles.loader}>
        <Text>No expert found</Text>
      </View>
    );
  }

  const imageUri = expert.image
    ? `${BASE_URL}/uploads/${expert.image}`
    : `https://ui-avatars.com/api/?name=${expert.name}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <RatingModal
        visible={ratingModal}
        onClose={() => setRatingModal(false)}
        onSubmit={handleSubmitRating}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: imageUri }} style={styles.avatar} />
          <Text style={styles.nameText}>{expert.name}</Text>
          <Text style={styles.roleText}>{expert.role}</Text>
        </View>
      </ScrollView>

      {/* ✅ FIXED BOTTOM BAR */}
      <View style={styles.bottomBarContainer}>
        <Pressable style={styles.chatAction} onPress={handleChatPress}>
          <MaterialCommunityIcons
            name="chat-processing-outline"
            size={22}
            color="#fff"
          />
          <Text style={styles.chatActionText}>Chat</Text>
        </Pressable>

        <Pressable style={styles.callAction} onPress={handleCallPress}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callActionText}>Call</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: { alignItems: "center", paddingTop: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  nameText: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  roleText: { fontSize: 14, color: "#C5A059" },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
    backgroundColor: "#FFF",
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  chatAction: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#0B2D72",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  callAction: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#0B2D72",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chatActionText: { fontWeight: "bold", color: "#FFF", fontSize: 16 },
  callActionText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
