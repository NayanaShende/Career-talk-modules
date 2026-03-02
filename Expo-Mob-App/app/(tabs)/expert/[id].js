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
  TouchableOpacity,
  Alert,
  Modal, // ← ADD THIS LINE
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpertById } from "../../../services/expertService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");
const BASE_URL = "http://192.168.1.3:3000";

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
      fetchExpert();
    } catch (err) {
      Alert.alert("Error", "Could not submit rating. Please try again.");
      console.log("Submit rating error:", err.message);
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
  const locationValue = expert?.location ?? "Java";
  const languagesValue = Array.isArray(expert?.languages)
    ? expert.languages.join(", ")
    : (expert?.language ?? "English");
  const certificationValue = expert?.certification ?? "Not specified";
  const totalReviews = expert.total_reviews || 0;

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
                uri:
                  expert.image ||
                  `https://ui-avatars.com/api/?name=${expert.name}&background=1A2B4C&color=fff`,
              }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.nameText}>{expert.name}</Text>
          <Text style={styles.roleText}>{expert.role}</Text>

          <View style={styles.pillRow}>
            <Text style={styles.pillLabel}>
              {experienceYears} Years Experience
            </Text>
            <Text style={styles.pillLabel}>{totalReviews} Reviews</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followText}>+ Follow</Text>
            </Pressable>

            <Pressable style={styles.askBtn}>
              <Text style={styles.askText}>Ask{"\n"}Question</Text>
            </Pressable>
            <Pressable
              style={styles.rateBtn}
              onPress={() => setRatingModal(true)}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.rateBtnText}>Rate</Text>
            </Pressable>
          </View>
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
              {expert.bio || `Graduate | ${experienceYears}-2 years experience`}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Details</Text>

          <View style={styles.detailsList}>
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

        <Pressable style={styles.callAction}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callActionText}>Call</Text>
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

  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 15,
  },

  roleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C5A059",
  },

  pillRow: { flexDirection: "row", gap: 15, marginTop: 10 },

  pillLabel: { fontSize: 13, color: "#666" },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

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

  askText: {
    color: "#FFF",
    fontWeight: "600",
    textAlign: "center",
  },
  rateBtn: {
    width: 90,
    height: 50,
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

  chatActionText: {
    fontWeight: "bold",
    color: "#FFF",
    fontSize: 16,
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

  callActionText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
