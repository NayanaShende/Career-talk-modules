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
  handleCallPress,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpertById } from "../../../services/expertService";
import { initiateCall } from "../../../services/callService";
const { width } = Dimensions.get("window");

export default function ExpertProfile() {
  const { id } = useLocalSearchParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.log("No ID received");
      setLoading(false);
      return;
    }
    fetchExpert();
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

    const handleCallPress = async () => {
    try {
      const callerId = 1; // ⚠️ Replace with logged-in user ID
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
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
      {/* ✅ ONLY CHANGE: added onPress */}
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