import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../services/api";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WalletModal from "../../home/WalletModal";

// import { SOCKET_URL as BASE_URL } from "../../../constants/config";
const BASE_URL = "http://192.168.1.14:3000";

const SKILL_FILTERS = [
  "All",
  "React",
  "React Native",
  "Python",
  "Node.js",
  "Java",
  "Angular",
  "DevOps",
  "UI/UX Design",
  "Data Analysis",
  "Machine Learning",
  "PHP",
  "Flutter",
];

function ExpertDashboard({
  onlineExperts,
  loadingOnline,
  filteredExperts,
  activeSkillFilter,
  setActiveSkillFilter,
  skillFilteredExperts,
  loadingSkillFilter,
  getImageUri,
  getInitials,
  getFirstSkill,
  getSkillChips,
}) {
  const [walletVisible, setWalletVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chats, setChats] = useState([]);
  const [loadingTxn, setLoadingTxn] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchChats();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axiosInstance.get("/experts/my/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res?.data?.data || []);
    } catch (e) {
      console.log("fetchTransactions error:", e.message);
      setTransactions([]);
    } finally {
      setLoadingTxn(false);
    }
  };

  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axiosInstance.get("/experts/my/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res?.data?.data || []);
    } catch (e) {
      console.log("fetchChats error:", e.message);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getUserImageUri = (image, name) => {
    if (image) {
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image; // ✅ already a Cloudinary URL
      }
      return `${BASE_URL}/uploads/${image}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=0B2D72&color=fff&size=128`;
  };

  const ExpertCard = ({ e }) => (
    <Pressable
      style={styles.skillExpertCard}
      onPress={() => router.push(`/expert/${e.id}`)}
    >
      {e.image ? (
        <Image
          source={{ uri: getImageUri(e.image, e.name) }}
          style={[styles.expertInitialCircle, { overflow: "hidden" }]}
        />
      ) : (
        <View style={styles.expertInitialCircle}>
          <Text style={styles.expertInitialText}>{getInitials(e.name)}</Text>
        </View>
      )}
      <Text style={styles.expertCardName} numberOfLines={1}>
        {e.name}
      </Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons
            key={s}
            name={s <= Math.round(e.rating || 0) ? "star" : "star-outline"}
            size={13}
            color={s <= Math.round(e.rating || 0) ? "#F5C518" : "#DDD"}
          />
        ))}
      </View>
      <Text style={styles.expText}>
        {e.experience > 0 ? `${e.experience} yrs exp` : "New"}
      </Text>
      <View style={styles.skillChipsRow}>
        {getSkillChips(e).map((skill, idx) => (
          <View key={idx} style={styles.expertSkillBadge}>
            <Text style={styles.expertSkillText}>{skill}</Text>
          </View>
        ))}
      </View>
      <View style={styles.expertCardFooter}>
        <Text style={styles.viewProfileText}>View Profile</Text>
        <Ionicons name="chevron-forward" size={12} color="#1a1a2e" />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>CT</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Career-Talk</Text>
          <Text style={styles.headerSub}>
            Find the right mentor for your career
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.searchBar}
        onPress={() => router.push("/expert/search")}
      >
        <Ionicons name="search" size={20} color="#C4C4C4" />
        <Text style={styles.searchText}>
          Search mentors, skills, careers...
        </Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>
              What will my future be{"\n"}in the next 5 years?
            </Text>
            <Text style={styles.promoSub}>Ask Expert</Text>
            <TouchableOpacity style={styles.askExpertBtn}>
              <Text style={styles.askExpertBtnText}>Ask Expert</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require("../../../assets/banner.png")}
            style={styles.promoImage}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Live Experts</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveIndicatorText}>Live</Text>
            </View>
          </View>
        </View>

        {loadingOnline ? (
          <ActivityIndicator color="#0B2D72" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveScrollContainer}
          >
            {onlineExperts.map((e) => (
              <LiveExpert
                key={e.id}
                name={e.name}
                title={getFirstSkill(e)}
                image={getImageUri(e.image, e.name)}
                onPress={() => router.push(`/expert/${e.id}`)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Skill</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {SKILL_FILTERS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.filterChip,
                activeSkillFilter === skill && styles.filterChipActive,
              ]}
              onPress={() => setActiveSkillFilter(skill)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeSkillFilter === skill && styles.filterChipTextActive,
                ]}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loadingSkillFilter ? (
          <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertBySkillList}
          >
            {skillFilteredExperts.map((e) => (
              <ExpertCard key={e.id} e={e} />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Top Experts</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {filteredExperts.map((e) => (
            <ExpertCard key={e.id} e={e} />
          ))}
        </ScrollView>

        {/* Recent Chats Section - HIDDEN (data still fetches in background) */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
        </View>
        {loadingChats ? (
          <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} />
        ) : (
          chats.map((c) => (
            <View key={c.id} style={styles.chatRow}>
              <Text style={styles.chatName}>{c.user_name}</Text>
              <Text style={styles.chatTime}>{c.created_at}</Text>
            </View>
          ))
        )} */}

        {/* Transactions Section - HIDDEN (data still fetches in background) */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
        </View>
        {loadingTxn ? (
          <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} />
        ) : (
          transactions.map((t) => (
            <View key={t.id} style={styles.txnRow}>
              <View>
                <Text style={styles.txnUser}>{t.user_name}</Text>
                <Text style={styles.txnDate}>{t.created_at}</Text>
              </View>
              <Text style={styles.txnAmount}>+₹{t.amount}</Text>
            </View>
          ))
        )} */}

      </ScrollView>

      <WalletModal
        visible={walletVisible}
        onClose={() => setWalletVisible(false)}
      />
    </SafeAreaView>
  );
}

// JOBSEEKER DASHBOARD
function JobseekerDashboard({
  onlineExperts,
  topExperts,
  loadingOnline,
  loadingTop,
  filteredExperts,
  loadingFiltered,
  activeSkillFilter,
  setActiveSkillFilter,
  skillFilteredExperts,
  loadingSkillFilter,
  getImageUri,
  getInitials,
  getFirstSkill,
  getSkillChips,
}) {
  const [walletVisible, setWalletVisible] = useState(false);

  const ExpertCard = ({ e, isFeatured }) => (
    <Pressable
      style={[
        styles.skillExpertCard,
        isFeatured && styles.skillExpertCardFeatured,
      ]}
      onPress={() => router.push(`/expert/${e.id}`)}
    >
      {isFeatured && (
        <View style={styles.topBadge}>
          <Ionicons name="star" size={11} color="#B8860B" />
          <Text style={styles.topBadgeText}>Top Expert</Text>
        </View>
      )}
      {e.image ? (
        <Image
          source={{ uri: getImageUri(e.image, e.name) }}
          style={[
            styles.expertInitialCircle,
            { overflow: "hidden" },
            isFeatured && { marginTop: 10 },
          ]}
        />
      ) : (
        <View
          style={[styles.expertInitialCircle, isFeatured && { marginTop: 10 }]}
        >
          <Text style={styles.expertInitialText}>{getInitials(e.name)}</Text>
        </View>
      )}
      <Text style={styles.expertCardName} numberOfLines={1}>
        {e.name}
      </Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons
            key={s}
            name={s <= Math.round(e.rating || 0) ? "star" : "star-outline"}
            size={13}
            color={s <= Math.round(e.rating || 0) ? "#F5C518" : "#DDD"}
          />
        ))}
      </View>
      <Text style={styles.expText}>
        {e.experience > 0 ? `${e.experience} Years Experience` : "New"}
      </Text>
      <View style={styles.skillChipsRow}>
        {getSkillChips(e).map((skill, idx) => (
          <View key={idx} style={styles.expertSkillBadge}>
            <Text style={styles.expertSkillText}>{skill}</Text>
          </View>
        ))}
      </View>
      <View style={styles.expertCardFooter}>
        <Text style={styles.viewProfileText}>View Profile</Text>
        <Ionicons name="chevron-forward" size={12} color="#1a1a2e" />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>CT</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Career-Talk</Text>
          <Text style={styles.headerSub}>
            Find the right mentor for your career
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.searchBar}
        onPress={() => router.push("/expert/search")}
      >
        <Ionicons name="search-outline" size={18} color="#AAAAAA" />
        <Text style={styles.searchText}>
          Search mentors, skills, careers...
        </Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>
              What will my future be{"\n"}in the next 5 years?
            </Text>
            <Text style={styles.promoSub}>Ask Expert</Text>
            <TouchableOpacity style={styles.askExpertBtn}>
              <Text style={styles.askExpertBtnText}>Ask Expert</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require("../../../assets/banner.png")}
            style={styles.promoImage}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Live Experts</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveIndicatorText}>Live</Text>
            </View>
          </View>
        </View>
        {loadingOnline ? (
          <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} />
        ) : onlineExperts.length === 0 ? (
          <Text style={styles.noExpertsText}>No experts online right now</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveScrollContainer}
          >
            {onlineExperts.map((e) => (
              <LiveExpert
                key={e.id}
                name={e.name || ""}
                title={getFirstSkill(e)}
                image={getImageUri(e.image, e.name)}
                onPress={() => router.push(`/expert/${e.id}`)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Skill</Text>
          <TouchableOpacity onPress={() => router.push("/expert/recommended")}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {SKILL_FILTERS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.filterChip,
                activeSkillFilter === skill && styles.filterChipActive,
              ]}
              onPress={() => setActiveSkillFilter(skill)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeSkillFilter === skill && styles.filterChipTextActive,
                ]}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {loadingSkillFilter ? (
          <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} />
        ) : skillFilteredExperts.length === 0 ? (
          <Text style={styles.noExpertsText}>
            No experts found for this skill
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertBySkillList}
          >
            {skillFilteredExperts.map((e, idx) => (
              <ExpertCard key={e.id} e={e} isFeatured={idx === 0} />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Top Expert by Skill</Text>
          <TouchableOpacity onPress={() => router.push("/expert/recommended")}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topExpertsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {loadingFiltered ? (
              <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} />
            ) : (
              filteredExperts.map((e, idx) => (
                <ExpertCard key={e.id} e={e} isFeatured={idx === 0} />
              ))
            )}
          </ScrollView>
        </View>

        {/* RECOMMENDED FOR YOU */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <Text style={styles.sectionSubTitle}>Based on your skills</Text>
          </View>
        </View>

        <View style={styles.recommendedGrid}>
          {filteredExperts.slice(0, 4).map((e) => (
            <Pressable
              key={e.id}
              style={styles.recCard}
              onPress={() => router.push(`/expert/${e.id}`)}
            >
              <View style={styles.recTop}>
                {e.image ? (
                  <Image
                    source={{ uri: getImageUri(e.image, e.name) }}
                    style={styles.recAvatar}
                  />
                ) : (
                  <View style={styles.recAvatarInitials}>
                    <Text style={styles.recAvatarText}>
                      {getInitials(e.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.recInfo}>
                  <Text style={styles.recName} numberOfLines={1}>
                    {e.name}
                  </Text>
                  <Text style={styles.recExp}>
                    {e.experience > 0
                      ? `${e.experience} Years Experience`
                      : "New"}
                  </Text>
                </View>
              </View>
              <View style={styles.recTagsRow}>
                {getSkillChips(e).map((skill, idx) => (
                  <View key={idx} style={styles.recTag}>
                    <Text style={styles.recTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.recFooter}>
                <Text style={styles.recViewText}>View Profile</Text>
                <Ionicons name="chevron-forward" size={12} color="#1a1a2e" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <WalletModal
        visible={walletVisible}
        onClose={() => setWalletVisible(false)}
      />
    </SafeAreaView>
  );
}

const LiveExpert = ({ name, title, image, onPress }) => (
  <Pressable style={styles.liveCard} onPress={onPress}>
    <Image
      source={{ uri: image }}
      style={styles.liveImage}
      onError={() => {}}
    />
    <View style={styles.liveBadge}>
      <View style={styles.liveBadgeDot} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
    <View style={styles.liveOverlay}>
      <Text style={styles.liveName}>{name}</Text>
      <Text style={styles.liveTitle}>{title}</Text>
    </View>
  </Pressable>
);

export default function Dashboard() {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checking, setChecking] = useState(true);
  const [onlineExperts, setOnlineExperts] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(true);
  const [topExperts, setTopExperts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [activeSkillFilter, setActiveSkillFilter] = useState("All");
  const [skillFilteredExperts, setSkillFilteredExperts] = useState([]);
  const [loadingSkillFilter, setLoadingSkillFilter] = useState(false);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  const socketRef = useRef(null);
  const expertIdRef = useRef(null);
  const socketInitialized = useRef(false);

  const getInitials = (name) => {
    if (!name) return "EX";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getImageUri = (image, name) => {
    if (image) {
      // ✅ If already a full Cloudinary or external URL, return as-is
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }
      // ✅ Otherwise it's a local file, prepend base URL
      const cleanImage = image.replace(/^uploads\//, "");
      return `${BASE_URL}/uploads/${cleanImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=2d6a5e&color=fff`;
  };

  const getFirstSkill = (expert) => {
    if (Array.isArray(expert.skills) && expert.skills.length > 0)
      return expert.skills[0].skill_name;
    return expert.domain || expert.role || "Expert";
  };

  const getSkillChips = (expert) => {
    if (Array.isArray(expert.skills) && expert.skills.length > 0)
      return expert.skills.slice(0, 2).map((s) => s.skill_name);
    return expert.domain ? [expert.domain] : [];
  };

  const fetchOnlineExperts = async () => {
    try {
      setLoadingOnline(true);
      const res = await axiosInstance.get("/experts/online");
      setOnlineExperts(res?.data?.data || []);
    } catch (e) {
      console.log("fetchOnlineExperts error:", e.message);
      setOnlineExperts([]);
    } finally {
      setLoadingOnline(false);
    }
  };

  const fetchTopExperts = async () => {
    try {
      setLoadingTop(true);
      const res = await axiosInstance.get("/experts");
      const list = res?.data?.data || [];
      const normalized = list.map((e) => ({
        ...e,
        rating: parseFloat(e.rating) || 0,
        experience: parseInt(e.experience) || 0,
      }));
      normalized.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setTopExperts(normalized.slice(0, 10));
    } catch {
      setTopExperts([]);
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchFilteredExperts = async (skill = "All") => {
    try {
      setLoadingFiltered(true);
      const url = skill === "All" ? "/experts" : `/experts?skill=${skill}`;
      const res = await axiosInstance.get(url);
      const list = res?.data?.data || [];
      const normalized = list.map((e) => ({
        ...e,
        rating: parseFloat(e.rating) || 0,
        experience: parseInt(e.experience) || 0,
      }));
      normalized.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setFilteredExperts(normalized);
    } catch {
      setFilteredExperts([]);
    } finally {
      setLoadingFiltered(false);
    }
  };

  const fetchExpertsBySkillFilter = async (skill) => {
    try {
      setLoadingSkillFilter(true);
      const res = await axiosInstance.get("/experts");
      const list = res?.data?.data || [];
      const normalized = list.map((e) => ({
        ...e,
        rating: parseFloat(e.rating) || 0,
        experience: parseInt(e.experience) || 0,
      }));
      const filtered =
        skill === "All"
          ? normalized
          : normalized.filter(
              (e) =>
                Array.isArray(e.skills) &&
                e.skills.some((s) =>
                  s.skill_name?.toLowerCase().includes(skill.toLowerCase()),
                ),
            );
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setSkillFilteredExperts(filtered);
    } catch {
      setSkillFilteredExperts([]);
    } finally {
      setLoadingSkillFilter(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        setUserData(user);
        const role = (user?.role || user?.userType || "user").toLowerCase();
        setUserRole(role);
      } catch (e) {
        setUserRole("user");
      } finally {
        setChecking(false);
      }
    };
    init();
    fetchTopExperts();
    fetchFilteredExperts("All");

    if (socketInitialized.current) return;
    socketInitialized.current = true;

    const setupSocket = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        socketRef.current = io(BASE_URL, {
          transports: ["websocket"],
          reconnectionAttempts: 3,
          reconnectionDelay: 3000,
          timeout: 10000,
          autoConnect: true,
        });

        socketRef.current.on("connect", () => {
          if (user?.id) {
            const role = (user.role || "").toLowerCase();
            if (role === "expert") {
              expertIdRef.current = user.id;
              socketRef.current.emit("expert:online", user.id);
              setTimeout(() => fetchOnlineExperts(), 500);
            } else {
              fetchOnlineExperts();
            }
          } else {
            fetchOnlineExperts();
          }
        });

        socketRef.current.on("expert:status", ({ expertId, is_online }) => {
          if (is_online) {
            setOnlineExperts((prev) => {
              const exists = prev.find((e) => e.id === expertId);
              if (!exists) fetchOnlineExperts();
              return prev;
            });
          } else {
            setOnlineExperts((prev) => prev.filter((e) => e.id !== expertId));
          }
        });

        socketRef.current.on("connect_error", () => fetchOnlineExperts());
        socketRef.current.io.on("reconnect_failed", () =>
          console.log("\u26d4 Socket gave up"),
        );
      } catch (err) {
        fetchOnlineExperts();
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        if (expertIdRef.current)
          socketRef.current.emit("expert:offline", expertIdRef.current);
        socketRef.current.disconnect();
        socketRef.current = null;
        socketInitialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    fetchExpertsBySkillFilter(activeSkillFilter);
  }, [activeSkillFilter]);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  const sharedProps = {
    onlineExperts,
    topExperts,
    loadingOnline,
    loadingTop,
    getImageUri,
    getInitials,
    getFirstSkill,
    getSkillChips,
  };

  if (userRole === "expert") {
    return (
      <ExpertDashboard
        user={userData}
        {...sharedProps}
        filteredExperts={filteredExperts}
        activeSkillFilter={activeSkillFilter}
        setActiveSkillFilter={setActiveSkillFilter}
        skillFilteredExperts={skillFilteredExperts}
        loadingSkillFilter={loadingSkillFilter}
      />
    );
  }
  return (
    <JobseekerDashboard
      {...sharedProps}
      filteredExperts={filteredExperts}
      loadingFiltered={loadingFiltered}
      activeSkillFilter={activeSkillFilter}
      setActiveSkillFilter={setActiveSkillFilter}
      skillFilteredExperts={skillFilteredExperts}
      loadingSkillFilter={loadingSkillFilter}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_LIGHT = "#efddff";
const TEAL_TEXT = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1a1a2e";
const TEXT_MUTED = "#888899";
const BORDER = "#eff0f2";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    marginTop: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 1,
  },

  // ── Search ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    marginTop: 16,
    marginLeft: 9,
    marginRight: 9,
    borderBottomColor: BORDER,
    gap: 10,
  },
  searchText: {
    color: "#AAAAAA",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  sectionSubTitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEAL,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e53935",
  },
  liveIndicatorText: {
    color: "#e53935",
    fontSize: 12,
    fontWeight: "700",
  },
  liveScrollContainer: {
    paddingLeft: 18,
    paddingBottom: 8,
  },
  liveCard: {
    width: 130,
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#4a4869",
  },
  liveImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53935",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  liveBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  liveOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  liveName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  liveTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    marginTop: 1,
  },

  // ── Skill Filter Chips ──
  filterList: {
    paddingLeft: 18,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#D0D0D8",
    backgroundColor: CARD_BG,
  },
  filterChipActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },
  filterChipTextActive: {
    color: "#fff",
  },

  // ── Expert Card ──
  expertBySkillList: {
    paddingLeft: 18,
    paddingBottom: 8,
  },
  scrollContainer: {
    paddingLeft: 18,
    paddingBottom: 8,
  },
  topExpertsContainer: {
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    marginHorizontal: 18,
    paddingVertical: 14,
    paddingLeft: 0,
  },
  skillExpertCard: {
    width: 158,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 14,
    paddingBottom: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },
  skillExpertCardFeatured: {
    borderColor: TEAL,
    borderWidth: 2,
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F5D76E",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B8860B",
  },
  expertInitialCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#867795",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
  },
  expertInitialText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },
  expertCardName: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 4,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 3,
  },
  expText: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 8,
  },
  skillChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    marginBottom: 10,
  },
  expertSkillBadge: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 50,
  },
  expertSkillText: {
    color: TEAL_TEXT,
    fontSize: 11,
    fontWeight: "700",
  },
  expertCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F3",
    paddingTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  // ── Recommended Cards ──
  recommendedGrid: {
    paddingHorizontal: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  recCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    width: "47.5%",
  },
  recTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  recAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
  },
  recAvatarInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#867795",
    justifyContent: "center",
    alignItems: "center",
  },
  recAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  recInfo: {
    flex: 1,
  },
  recName: {
    fontSize: 13,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  recExp: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  recTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 10,
  },
  recTag: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  recTagText: {
    color: TEAL_TEXT,
    fontSize: 11,
    fontWeight: "700",
  },
  recFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F3",
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  recViewText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  // ── Chat Row ──
  chatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    backgroundColor: CARD_BG,
  },
  chatName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  chatTime: {
    fontSize: 11,
    color: TEXT_MUTED,
  },

  // ── Transaction Row ──
  txnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    backgroundColor: CARD_BG,
  },
  txnUser: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  txnDate: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: TEAL,
  },

  // ── Chat & Txn item rows (used in FlatList variants) ──
  chatItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  chatItemAvatar: { width: 44, height: 44, borderRadius: 22 },
  chatItemName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  chatItemDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  chatItemAmount: { fontSize: 14, fontWeight: "700", color: "#0FA688" },
  txnItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  txnItemAvatar: { width: 44, height: 44, borderRadius: 22 },
  txnItemName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  txnTypeBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 3,
    marginBottom: 2,
  },
  txnTypeText: { fontSize: 10, fontWeight: "700" },
  txnItemDate: { fontSize: 11, color: "#9CA3AF" },
  txnItemAmount: { fontSize: 16, fontWeight: "800", color: "#0FA688" },

  // ── Banner ──
  promoBanner: {
    backgroundColor: "#ede4f6",
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    marginBottom: 4,
    marginTop: 16,
    overflow: "hidden",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  promoSub: {
    fontSize: 16,
    fontWeight: "800",
    color: TEAL,
    marginTop: 6,
  },
  askExpertBtn: {
    marginTop: 12,
    backgroundColor: TEAL,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  askExpertBtnText: {
    color: "#fff",
    fontSize: 13,
  },
  promoImage: {
    width: 130,
    height: 120,
    borderRadius: 12,
  },

  // ── Misc ──
  noExpertsText: {
    textAlign: "center",
    color: TEXT_MUTED,
    marginVertical: 20,
    fontSize: 14,
    paddingHorizontal: 18,
  },
  statNumber: { fontSize: 22, fontWeight: "700", color: "#0FA688" },
  statLabel: { fontSize: 12, color: "#777", marginTop: 4 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  tabActive: { backgroundColor: "#0FA688" },
  tabText: { color: "#777" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
});