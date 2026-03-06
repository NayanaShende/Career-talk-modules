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
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpertById } from "../../../services/expertService";
import { initiateCall } from "../../../services/callService";
import axiosInstance from "../../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const BASE_URL = "http://10.89.141.25:3000";

// ✅ FIXED: parse float before rounding so "3" shows 3 stars not 2
function StarRating({ rating, size = 20 }) {
  const roundedRating = Math.round(parseFloat(rating) || 0);
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= roundedRating ? "star" : "star-outline"}
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
          <Text style={styles.modalSubtitle}>
            How would you rate your experience?
          </Text>
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
          <Text style={styles.ratingLabel}>
            {selectedRating === 1
              ? "Poor"
              : selectedRating === 2
                ? "Fair"
                : selectedRating === 3
                  ? "Good"
                  : selectedRating === 4
                    ? "Very Good"
                    : selectedRating === 5
                      ? "Excellent!"
                      : "Tap a star"}
          </Text>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitRatingBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}>
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
      console.log("No ID received");
      setLoading(false);
      return;
    }
    fetchExpert();
    fetchRatings();
  }, [id]);

  const fetchExpert = async () => {
    try {
      const res = await getExpertById(id);
      const data = res?.data || res;
      console.log("✅ Expert profile data:", JSON.stringify(data));
      setExpert(data);
    } catch (err) {
      console.log("Profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: parse avgRating as float, totalReviews as int
  const fetchRatings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axiosInstance.get(`/experts/${id}/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res?.data?.data || res?.data || {};
      setRatingData({
        avgRating: parseFloat(data.avgRating) || 0,
        totalReviews: parseInt(data.totalReviews) || 0,
      });
    } catch (err) {
      console.log("Ratings fetch error:", err.message);
    }
  };

  const handleSubmitRating = async (rating) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login to submit a rating");
        return;
      }
      await axiosInstance.post(
        `/experts/${id}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert("Thank you!", "Your rating has been submitted.");
      fetchRatings();
    } catch (err) {
      console.log("Rating submit error:", err.response?.data || err.message);
      Alert.alert("Error", "Could not submit rating");
    }
  };

  const handleCallPress = async () => {
    try {
      const callerId = 1;
      const receiverId = id;
      const response = await initiateCall(callerId, receiverId);
      console.log("Call initiated:", response.data);
      Alert.alert("Success", "Call initiated successfully!");
    } catch (error) {
      console.log("Call error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to initiate call");
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

  const experienceYears =
    expert?.years_of_experience ?? expert?.experience ?? "0";
  const locationValue = expert?.location ?? "Not specified";
  const languagesValue = Array.isArray(expert?.languages)
    ? expert.languages.join(", ")
    : (expert?.language_spoken ?? expert?.language ?? "Not specified");
  const certificationValue = expert?.certification ?? "Not specified";
  const totalReviews = ratingData.totalReviews || expert.total_reviews || 0;
  const skills = Array.isArray(expert?.skills) ? expert.skills : [];
  const displayDomain = expert?.domain || "Expert";

  const handleChatPress = () => {
    if (!id) {
      Alert.alert("Error", "Expert ID not found");
      return;
    }
    router.push({
      pathname: "/home/chatscreen",
      params: {
        expertId: id,
        name: expert.name,
        avatar: expert.image,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <RatingModal
        visible={ratingModal}
        onClose={() => setRatingModal(false)}
        onSubmit={handleSubmitRating}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}>
        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: expert.image
                  ? `${BASE_URL}/uploads/${expert.image}`
                  : `https://ui-avatars.com/api/?name=${expert.name}&background=1A2B4C&color=fff`,
              }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.nameText}>{expert.name}</Text>

          {/* ✅ show domain instead of role */}
          <Text style={styles.roleText}>{displayDomain}</Text>

          <View style={styles.pillRow}>
            <Text style={styles.pillLabel}>
              {experienceYears} Years Experience
            </Text>
            <Text style={styles.pillLabel}>{totalReviews} Reviews</Text>
          </View>

          {/* ✅ FIXED: pass raw float to StarRating, show numeric score */}
          <View style={{ marginTop: 8 }}>
            <StarRating rating={ratingData.avgRating} size={22} />
          </View>

          {/* ✅ FIXED: show exact rating number so user can verify */}
          <Text style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            {ratingData.avgRating > 0
              ? `${ratingData.avgRating.toFixed(1)} / 5 (${ratingData.totalReviews} reviews)`
              : "No ratings yet"}
          </Text>

          {/* Rate button */}
          <TouchableOpacity
            style={styles.rateBtn}
            onPress={() => setRatingModal(true)}>
            <Ionicons name="star" size={16} color="#fff" />
            <Text style={styles.rateBtnText}>Rate</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT SECTION */}
        <View style={styles.contentCard}>
          <View style={styles.tabContainer}>
            <Text style={styles.activeTab}>Overview</Text>
            <Text style={styles.inactiveTab}>Sessions</Text>
            <Text style={styles.inactiveTab}>Articles</Text>
          </View>

          <View style={styles.aboutBox}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.aboutText}>
              {expert.bio ||
                `${experienceYears} years of experience in ${displayDomain}`}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Details</Text>

          <View style={styles.detailsList}>
            <DetailItem icon="domain" label="Domain" value={displayDomain} />
            <DetailItem
              icon="briefcase-outline"
              label="Experience"
              value={`${experienceYears} Years`}
            />
            <DetailItem
              icon="map-marker-outline"
              label="Location"
              value={locationValue}
            />
            <DetailItem
              icon="translate"
              label="Languages"
              value={languagesValue}
            />
            <DetailItem
              icon="certificate-outline"
              label="Certification"
              value={certificationValue}
            />
          </View>

          {/* Skills section */}
          {skills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsGrid}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillGridChip}>
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={16}
                      color="#C5A059"
                    />
                    <Text style={styles.skillGridText}>{skill.skill_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View style={styles.bottomBarContainer}>
        <Pressable style={styles.chatAction} onPress={handleChatPress}>
          <MaterialCommunityIcons
            name="chat-processing-outline"
            size={22}
            color="#fff"
          />
          <Text style={styles.chatActionText}>Chat</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <MaterialCommunityIcons name={icon} size={20} color="#C5A059" />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  avatarWrapper: {
    padding: 3,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#C5A059",
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  nameText: { fontSize: 26, fontWeight: "bold", marginTop: 15 },
  roleText: { fontSize: 14, fontWeight: "700", color: "#C5A059" },
  pillRow: { flexDirection: "row", gap: 15, marginTop: 10 },
  pillLabel: { fontSize: 13, color: "#666" },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  followBtn: {
    width: 90,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  followText: { color: "#FFF", fontWeight: "600" },
  askBtn: {
    width: 90,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  askText: { color: "#FFF", fontWeight: "600", textAlign: "center" },
  rateBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#C5A059",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  rateBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  contentCard: { paddingHorizontal: 20 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  activeTab: {
    fontSize: 15,
    fontWeight: "600",
    color: "#C5A059",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#C5A059",
  },
  inactiveTab: { fontSize: 15, color: "#555", paddingBottom: 10 },
  aboutBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  aboutText: { fontSize: 14, color: "#555" },
  detailsList: { marginTop: 10 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailLabel: { fontSize: 14, color: "#555" },
  detailValue: { fontSize: 14, fontWeight: "600" },
  skillsSection: { marginTop: 25 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillGridChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF8EC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C5A059",
  },
  skillGridText: { fontSize: 13, color: "#0B2D72", fontWeight: "600" },
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
  chatActionText: { fontWeight: "bold", color: "#FFF", fontSize: 16 },
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
  callActionText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2D72",
    marginBottom: 6,
  },
  modalSubtitle: { fontSize: 14, color: "#888", marginBottom: 20 },
  starSelector: { flexDirection: "row", marginBottom: 12 },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C5A059",
    marginBottom: 24,
    height: 24,
  },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#555", fontWeight: "600" },
  submitRatingBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  submitRatingBtnText: { color: "#fff", fontWeight: "700" },
});
