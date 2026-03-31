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
  TextInput,
  Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpertById } from "../../../services/expertService";
import { initiateCall } from "../../../services/callService";
import axiosInstance from "../../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
// import { SOCKET_URL as BASE_URL } from "../../../constants/config";
const BASE_URL = "http://10.235.241.9:3000";

// ─────────────────────────────────────────────
// ✅ Helper: resolve any image (Cloudinary or local)
// ─────────────────────────────────────────────
const getImageUri = (image, fallbackName = "Expert") => {
  if (image) {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const cleanImage = image.replace(/^uploads\//, "");
    return `${BASE_URL}/uploads/${cleanImage}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=1F5C4F&color=fff&size=128`;
};

// ─────────────────────────────────────────────
// Star Rating Display
// ─────────────────────────────────────────────
function StarRating({ rating, size = 20 }) {
  const roundedRating = Math.round(parseFloat(rating) || 0);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= roundedRating ? "star" : "star-outline"}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────
// ✅ NEW: Insufficient Balance Modal
// Matches screenshot exactly:
//  - Light purple circle + wallet icon
//  - Bold title
//  - Info box with red values
//  - Subtitle
//  - Cancel (grey) + Add Money (purple) buttons
// ─────────────────────────────────────────────
function InsufficientBalanceModal({
  visible,
  balance,
  minimumRequired,
  onAddMoney,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={ibm.overlay}>
        <View style={ibm.card}>
          {/* Wallet icon circle */}
          <View style={ibm.iconCircle}>
            <Ionicons name="wallet-outline" size={36} color="#867795" />
          </View>

          {/* Title */}
          <Text style={ibm.title}>Insufficient Balance</Text>

          {/* Info box */}
          <View style={ibm.infoBox}>
            <View style={ibm.infoRow}>
              <Text style={ibm.infoLabel}>Required</Text>
              <Text style={ibm.infoValueRed}>₹{minimumRequired} minimum</Text>
            </View>
            <View style={[ibm.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={ibm.infoLabel}>Your Balance</Text>
              <Text style={ibm.infoValueRed}>
                ₹{parseFloat(balance || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={ibm.subtitle}>
            Add money to your wallet to start chatting with experts.
          </Text>

          {/* Buttons */}
          <View style={ibm.btnRow}>
            <TouchableOpacity
              style={ibm.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={ibm.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={ibm.addBtn}
              onPress={onAddMoney}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={ibm.addTxt}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Rating Modal
// ─────────────────────────────────────────────
function RatingModal({ visible, onClose, onSubmit }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      Alert.alert("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Please add a comment");
      return;
    }
    setSubmitting(true);
    await onSubmit(selectedRating, comment.trim());
    setSubmitting(false);
    setSelectedRating(0);
    setComment("");
    onClose();
  };

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Share Your Experience</Text>
          <Text style={styles.modalSubtitle}>
            How would you rate this expert?
          </Text>

          <View style={styles.starSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setSelectedRating(star)}
                style={styles.starBtn}
              >
                <Ionicons
                  name={star <= selectedRating ? "star" : "star-outline"}
                  size={36}
                  color={star <= selectedRating ? "#F59E0B" : "#D1D5DB"}
                />
              </Pressable>
            ))}
          </View>

          {selectedRating > 0 && (
            <View style={styles.ratingLabelBadge}>
              <Text style={styles.ratingLabel}>{labels[selectedRating]}</Text>
            </View>
          )}

          <TextInput
            style={styles.commentInput}
            placeholder="Tell others about your experience..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
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
                {submitting ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Individual Review Card
// ─────────────────────────────────────────────
const ReviewCard = ({ review }) => {
  const userName =
    review.user?.name || review.userName || review.reviewer_name || "Anonymous";
  const userImage =
    review.user?.image || review.userImage || review.reviewer_image || null;

  const avatarUri = getImageUri(userImage, userName);

  const reviewDate = review.createdAt || review.created_at || null;

  return (
    <View style={reviewStyles.card}>
      <View style={reviewStyles.header}>
        <Image
          source={{ uri: avatarUri }}
          style={reviewStyles.avatar}
          onError={(e) => {
            e.currentTarget.setNativeProps({
              src: [
                {
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1F5C4F&color=fff&size=80`,
                },
              ],
            });
          }}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={reviewStyles.name}>{userName}</Text>
          <StarRating rating={review.rating} size={12} />
        </View>
        {reviewDate && (
          <Text style={reviewStyles.date}>
            {new Date(reviewDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        )}
      </View>
      {review.comment ? (
        <Text style={reviewStyles.comment}>{review.comment}</Text>
      ) : null}
    </View>
  );
};

// ─────────────────────────────────────────────
// Reviews Section
// ─────────────────────────────────────────────
const ReviewsSection = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;
  return (
    <View style={{ marginTop: 28 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{reviews.length}</Text>
        </View>
      </View>
      {reviews.map((review, index) => (
        <ReviewCard key={review.id || index} review={review} />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// Detail Row Item
// ─────────────────────────────────────────────
const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconBox}>
      <MaterialCommunityIcons name={icon} size={18} color="#574964" />
    </View>
    <View style={styles.detailTextGroup}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// Stat Pill
// ─────────────────────────────────────────────
const StatPill = ({ value, label }) => (
  <View style={styles.statPill}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function ExpertProfile() {
  const { id } = useLocalSearchParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ratingData, setRatingData] = useState({
    avgRating: 0,
    totalReviews: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");

  // ── NEW: insufficient balance modal state ──
  const [balanceModal, setBalanceModal] = useState({
    visible: false,
    balance: 0,
    minimumRequired: 150,
  });

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
      const token = await AsyncStorage.getItem("token");
      const res = await axiosInstance.get(`/experts/${id}/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res?.data?.data || res?.data || {};
      setRatingData({
        avgRating: parseFloat(data.avgRating) || 0,
        totalReviews: parseInt(data.totalReviews) || 0,
      });
      const reviewList = data.reviews || data.ratings || data.ratingsList || [];
      setReviews(reviewList);
    } catch (err) {
      console.log("Ratings fetch error:", err.message);
    }
  };

  const handleSubmitRating = async (rating, comment) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login to submit a rating");
        return;
      }
      await axiosInstance.post(
        `/experts/${id}/rate`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert("Thank you!", "Your rating has been submitted.");
      fetchRatings();
    } catch (err) {
      if (err.response?.status === 409) {
        Alert.alert("Already Rated", "You have already rated this expert.");
      } else {
        Alert.alert("Error", "Could not submit rating");
      }
    }
  };

  const handleCallPress = async () => {
    try {
      const callerId = currentUserId || 1;
      const response = await initiateCall(callerId, id);
      Alert.alert("Success", "Call initiated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to initiate call");
    }
  };

  // ✅ UPDATED: Check wallet balance — shows custom modal instead of Alert
  const handleChatPress = async () => {
    if (!expert) {
      Alert.alert("Error", "Expert data not loaded");
      return;
    }
    const receiverUserId = expert?.userId || expert?.user_id || id;
    if (String(currentUserId) === String(receiverUserId)) {
      Alert.alert("Error", "Cannot chat with yourself");
      return;
    }

    const MINIMUM_BALANCE = 150;

    try {
      const balanceRes = await axiosInstance.get(
        `/wallet/balance/${currentUserId}`,
      );
      const walletBalance = parseFloat(balanceRes?.data?.balance || 0);

      if (walletBalance < MINIMUM_BALANCE) {
        // ── Show custom modal instead of Alert.alert ──
        setBalanceModal({
          visible: true,
          balance: walletBalance,
          minimumRequired: MINIMUM_BALANCE,
        });
        return;
      }

      // ✅ Balance is enough — proceed to chat
      router.push({
        pathname: "/home/chatscreen",
        params: {
          expertId: receiverUserId,
          name: expert?.name,
          avatar: expert?.image,
        },
      });
    } catch (error) {
      console.log("Balance check error:", error.message);
      // If balance check fails, still allow chat
      router.push({
        pathname: "/home/chatscreen",
        params: {
          expertId: receiverUserId,
          name: expert?.name,
          avatar: expert?.image,
        },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#574964" />
      </View>
    );
  }

  if (!expert) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#6B7280" }}>Expert not found</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <RatingModal
        visible={ratingModal}
        onClose={() => setRatingModal(false)}
        onSubmit={handleSubmitRating}
      />

      {/* ── INSUFFICIENT BALANCE MODAL ── */}
      <InsufficientBalanceModal
        visible={balanceModal.visible}
        balance={balanceModal.balance}
        minimumRequired={balanceModal.minimumRequired}
        onAddMoney={() => {
          setBalanceModal({ visible: false, balance: 0, minimumRequired: 150 });
          router.push("/(tabs)/wallet");
        }}
        onCancel={() =>
          setBalanceModal({ visible: false, balance: 0, minimumRequired: 150 })
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* ── HERO HEADER ── */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.avatarRing}>
            <Image
              source={{
                uri: getImageUri(expert.image, expert.name || "Expert"),
              }}
              style={styles.avatar}
              onError={(e) => {
                e.currentTarget.setNativeProps({
                  src: [
                    {
                      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || "Expert")}&background=4338CA&color=fff`,
                    },
                  ],
                });
              }}
            />
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.nameText}>{expert.name}</Text>

          <View style={styles.domainBadge}>
            <Text style={styles.domainBadgeText}>{displayDomain}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatPill value={`${experienceYears}y`} label="Experience" />
            <View style={styles.statDivider} />
            <StatPill
              value={
                ratingData.avgRating > 0 ? ratingData.avgRating.toFixed(1) : "—"
              }
              label="Avg Rating"
            />
            <View style={styles.statDivider} />
            <StatPill value={totalReviews} label="Reviews" />
          </View>

          {/* Stars + Rate Button */}
          <View style={styles.ratingRow}>
            <StarRating rating={ratingData.avgRating} size={18} />
            <TouchableOpacity
              style={styles.rateBtn}
              onPress={() => setRatingModal(true)}
            >
              <Ionicons name="create-outline" size={15} color="#1F5C4F" />
              <Text style={styles.rateBtnText}>Rate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CONTENT CARD ── */}
        <View style={styles.contentCard}>
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            {["Overview"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.tabItemActive,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* About */}
          <View style={styles.aboutBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.aboutText}>
              {expert.bio ||
                `${experienceYears} years of experience in ${displayDomain}.`}
            </Text>
          </View>

          {/* Details */}
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Details</Text>
            </View>
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
          </View>

          {/* Skills */}
          {skills.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Skills</Text>
              </View>
              <View style={styles.skillsGrid}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill.skill_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <ReviewsSection reviews={reviews} />
        </View>
      </ScrollView>

      {/* ── BOTTOM BAR ── */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.chatBtn} onPress={handleChatPress}>
          <MaterialCommunityIcons
            name="chat-processing-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.chatBtnText}>Message</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Insufficient Balance Modal Styles
// ─────────────────────────────────────────────
const ibm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 14,
  },
  // Light purple circle with wallet icon — matches screenshot
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#ede8f5",
    borderWidth: 1.5,
    borderColor: "#c9bada",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  // Light blue-grey info box — matches screenshot
  infoBox: {
    width: "100%",
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dde3f5",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Red values — matches screenshot
  infoValueRed: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ef4444",
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  // Grey Cancel button — matches screenshot
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelTxt: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  // Purple Add Money button with + icon — matches screenshot
  addBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#867795",
    alignItems: "center",
    justifyContent: "center",
  },
  addTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});

// ─────────────────────────────────────────────
// Review Card Styles
// ─────────────────────────────────────────────
const reviewStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#C2DDD9",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  comment: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
});

// ─────────────────────────────────────────────
// Main Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  // Hero
  heroSection: {
    backgroundColor: "#867795",
    marginTop: 22,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarRing: {
    padding: 3,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 14,
    position: "relative",
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#574964",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  domainBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  domainBadgeText: { color: "#f5ebff", fontSize: 13, fontWeight: "600" },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
    width: "100%",
  },
  statPill: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Rating row
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  rateBtnText: { color: "#867795", fontWeight: "700", fontSize: 13 },

  // Content card
  contentCard: {
    marginTop: -16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 400,
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  tabTextActive: { color: "#867795", fontWeight: "700" },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  countBadge: {
    backgroundColor: "#e6daf1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 12, color: "#867795", fontWeight: "700" },

  // About
  aboutBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  aboutText: { fontSize: 14, color: "#6B7280", lineHeight: 22 },

  // Details
  detailsList: { gap: 2 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 14,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e4daed",
    justifyContent: "center",
    alignItems: "center",
  },
  detailTextGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    maxWidth: "55%",
    textAlign: "right",
  },

  // Skills
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    backgroundColor: "#e6daf1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e6daf1",
  },
  skillChipText: { fontSize: 13, color: "#574964", fontWeight: "600" },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    gap: 12,
  },
  chatBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#867795",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#867795",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chatBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Rating Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  modalSubtitle: { fontSize: 14, color: "#9CA3AF", marginBottom: 24 },
  starSelector: { flexDirection: "row", gap: 8, marginBottom: 12 },
  starBtn: { padding: 4 },
  ratingLabelBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  ratingLabel: { fontSize: 14, fontWeight: "700", color: "#D97706" },
  commentInput: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    marginBottom: 20,
    textAlignVertical: "top",
    minHeight: 90,
    backgroundColor: "#F9FAFB",
  },
  modalBtns: { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#6B7280", fontWeight: "700", fontSize: 15 },
  submitRatingBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#867795",
    justifyContent: "center",
    alignItems: "center",
  },
  submitRatingBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
