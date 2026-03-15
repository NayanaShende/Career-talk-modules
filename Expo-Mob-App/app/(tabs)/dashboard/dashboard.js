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

const BASE_URL = "http://192.168.1.6:3000";

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

// ─────────────────────────────────────────────────────────────────────────────
//  EXPERT DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
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
      const res = await axiosInstance.get("/expert/transactions");
      setTransactions(res?.data?.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingTxn(false);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await axiosInstance.get("/expert/chats");
      setChats(res?.data?.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingChats(false);
    }
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
          <Text style={styles.expertInitialText}>
            {getInitials(e.name)}
          </Text>
        </View>
      )}

      <Text style={styles.expertCardName} numberOfLines={1}>
        {e.name}
      </Text>

      <View style={styles.starRow}>
        {[1,2,3,4,5].map((s)=>(
          <Ionicons
            key={s}
            name={s <= Math.round(e.rating || 0) ? "star" : "star-outline"}
            size={14}
            color="#FBBF24"
          />
        ))}
      </View>

      <Text style={styles.expText}>
        {e.experience > 0 ? `${e.experience} yrs` : "New"}
      </Text>

      <View style={styles.skillChipsRow}>
        {getSkillChips(e).map((skill,idx)=>(
          <View key={idx} style={styles.expertSkillBadge}>
            <Text style={styles.expertSkillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <View style={styles.expertCardFooter} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>CT</Text>
        </View>
        <Text style={styles.headerTitle}>Career-Talk</Text>
      </View>

      {/* SEARCH */}
      <Pressable
        style={styles.searchBar}
        onPress={() => router.push("/expert/search")}
      >
        <Ionicons name="search" size={20} color="#C4C4C4"/>
        <Text style={styles.searchText}>Search</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* BANNER */}
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

        {/* LIVE EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Experts</Text>

          <View style={styles.liveIndicator}>
            <View style={styles.liveDot}/>
            <Text style={styles.liveIndicatorText}>Live</Text>
          </View>
        </View>

        {loadingOnline ? (
          <ActivityIndicator color="#0B2D72"/>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveScrollContainer}
          >
            {onlineExperts.map((e)=>(
              <LiveExpert
                key={e.id}
                name={e.name}
                title={getFirstSkill(e)}
                image={getImageUri(e.image,e.name)}
                onPress={()=>router.push(`/expert/${e.id}`)}
              />
            ))}
          </ScrollView>
        )}

        {/* BROWSE BY SKILL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Skill</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {SKILL_FILTERS.map((skill)=>(
            <TouchableOpacity
              key={skill}
              style={[
                styles.filterChip,
                activeSkillFilter === skill && styles.filterChipActive
              ]}
              onPress={()=>setActiveSkillFilter(skill)}
            >
              <Text style={[
                styles.filterChipText,
                activeSkillFilter === skill && styles.filterChipTextActive
              ]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loadingSkillFilter ? (
          <ActivityIndicator color="#0B2D72"/>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertBySkillList}
          >
            {skillFilteredExperts.map((e)=>(
              <ExpertCard key={e.id} e={e}/>
            ))}
          </ScrollView>
        )}

        {/* TOP EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Experts</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {filteredExperts.map((e)=>(
            <ExpertCard key={e.id} e={e}/>
          ))}
        </ScrollView>

        {/* CHAT HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Chats</Text>
        </View>

        {loadingChats ? (
          <ActivityIndicator/>
        ) : chats.map((c)=>(
          <View key={c.id} style={styles.chatRow}>
            <Text style={styles.chatName}>{c.user_name}</Text>
            <Text style={styles.chatTime}>{c.created_at}</Text>
          </View>
        ))}

        {/* TRANSACTION HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>

        {loadingTxn ? (
          <ActivityIndicator/>
        ) : transactions.map((t)=>(
          <View key={t.id} style={styles.txnRow}>
            <View>
              <Text style={styles.txnUser}>{t.user_name}</Text>
              <Text style={styles.txnDate}>{t.created_at}</Text>
            </View>

            <Text style={styles.txnAmount}>+₹{t.amount}</Text>
          </View>
        ))}

      </ScrollView>

      <WalletModal
        visible={walletVisible}
        onClose={()=>setWalletVisible(false)}
      />

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  JOBSEEKER DASHBOARD  (your original dashboard — untouched)
// ─────────────────────────────────────────────────────────────────────────────
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
            size={14}
            color="#FBBF24"
          />
        ))}
      </View>
      <Text style={styles.expText}>
        {e.experience > 0 ? `${e.experience} yrs` : "New"}
      </Text>
      <View style={styles.skillChipsRow}>
        {getSkillChips(e).map((skill, idx) => (
          <View key={idx} style={styles.expertSkillBadge}>
            <Text style={styles.expertSkillText}>{skill}</Text>
          </View>
        ))}
      </View>
      <View style={styles.expertCardFooter} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>CT</Text>
        </View>
        <Text style={styles.headerTitle}>Career-Talk</Text>
      </View>

      {/* SEARCH */}
      <Pressable
        style={styles.searchBar}
        onPress={() => router.push("/expert/search")}
      >
        <Ionicons name="search" size={20} color="#C4C4C4" />
        <Text style={styles.searchText}>Search</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* BANNER */}
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

        {/* LIVE EXPERTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Experts</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveIndicatorText}>Live</Text>
          </View>
        </View>
        {loadingOnline ? (
          <ActivityIndicator color="#0B2D72" />
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

        {/* BROWSE BY SKILL */}
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
          <ActivityIndicator color="#0B2D72" style={{ marginVertical: 20 }} />
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
            {skillFilteredExperts.map((e) => (
              <ExpertCard key={e.id} e={e} />
            ))}
          </ScrollView>
        )}

        {/* TOP EXPERT BY SKILL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Expert by Skill</Text>
          <TouchableOpacity onPress={() => router.push("/expert/recommended")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {loadingFiltered ? (
            <ActivityIndicator color="#0B2D72" style={{ marginVertical: 20 }} />
          ) : (
            filteredExperts.map((e) => (
              <Pressable
                key={e.id}
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
                    <Text style={styles.expertInitialText}>
                      {getInitials(e.name)}
                    </Text>
                  </View>
                )}
                <Text style={styles.expertCardName} numberOfLines={1}>
                  {e.name}
                </Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={
                        s <= Math.round(e.rating || 0) ? "star" : "star-outline"
                      }
                      size={14}
                      color="#FBBF24"
                    />
                  ))}
                </View>
                <Text style={styles.expText}>
                  {e.experience > 0 ? `${e.experience} yrs` : "New"}
                </Text>
                <View style={styles.skillChipsRow}>
                  {getSkillChips(e).map((skill, idx) => (
                    <View key={idx} style={styles.expertSkillBadge}>
                      <Text style={styles.expertSkillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.expertCardFooter} />
              </Pressable>
            ))
          )}
        </ScrollView>
      </ScrollView>

      <WalletModal
        visible={walletVisible}
        onClose={() => setWalletVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE EXPERT CARD (shared)
// ─────────────────────────────────────────────────────────────────────────────
const LiveExpert = ({ name, title, image, onPress }) => (
  <Pressable style={styles.liveCard} onPress={onPress}>
    <Image
      source={{ uri: image }}
      style={styles.liveImage}
      onError={() => {}}
    />
    <View style={styles.liveBadge}>
      <Text style={styles.liveText}>LIVE</Text>
    </View>
    <View style={styles.liveOverlay}>
      <Text style={styles.liveName}>{name}</Text>
      <Text style={styles.liveTitle}>{title}</Text>
    </View>
  </Pressable>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT — role switcher + shared data fetching + socket
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  // ── shared state ──
  const [userRole, setUserRole] = useState(null); // "expert" | "user"
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

  // ── helpers (shared by both dashboards) ──
  const getInitials = (name) => {
    if (!name) return "EX";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getImageUri = (image, name) => {
    if (image) {
      const cleanImage = image.replace(/^uploads\//, "");
      return `${BASE_URL}/uploads/${cleanImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=1A2B4C&color=fff`;
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

  // ── data fetchers ──
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

  // ── on mount: load user role + socket + shared data ──
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
          console.log("⛔ Socket gave up"),
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

  // ── loading screen ──
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
        <ActivityIndicator size="large" color="#0FA688" />
      </View>
    );
  }

  // ── shared props passed to both dashboards ──
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

  // ✅ ROLE SWITCH — expert sees ExpertDashboard, everyone else sees JobseekerDashboard
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
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },

  // ── jobseeker header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    marginTop: 10,
    shadowRadius: 4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgb(113, 149, 255)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
    color: "#333",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgb(244, 247, 255)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginHorizontal: 16,
    marginBottom: 15,
    marginTop: 10,
  },
  searchText: {
    color: "rgb(90, 91, 93)",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },

  // ── expert header ──
  expertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgb(113, 149, 255)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  expertAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  expertAvatarTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16A34A",
    position: "absolute",
    bottom: 0,
    left: 38,
    borderWidth: 2,
    borderColor: "rgb(113, 149, 255)",
  },
  expertGreet: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  expertName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  withdrawBtn: {
    borderWidth: 1.5,
    borderColor: "#0FA688",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  withdrawTxt: { color: "#0FA688", fontWeight: "700", fontSize: 14 },

  // ── earnings banner ──
  earnBanner: {
    flexDirection: "row",
    backgroundColor: "#0FA688",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  earnLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    fontWeight: "600",
  },
  earnAmount: { fontSize: 28, fontWeight: "800", color: "#fff", marginTop: 4 },
  earnWeek: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  earnDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 20,
  },
  earnBigNum: { fontSize: 28, fontWeight: "800", color: "#fff" },
  earnSmallLbl: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  // ── expert tabs ──
  expertTabRow: {
    flexDirection: "row",
    backgroundColor: "rgb(113, 149, 255)",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  expertTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  expertTabActive: { backgroundColor: "#0FA688" },
  expertTabTxt: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
  expertTabTxtActive: { color: "#0D2E2A", fontWeight: "700" },

  // ── expert sections ──
  expertSection: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  expertSectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  expertSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  seeAllTeal: { fontSize: 13, color: "#0FA688", fontWeight: "600" },

  // live pill
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgb(113, 149, 255)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  livePillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },
  livePillTxt: { fontSize: 12, color: "#DC2626", fontWeight: "600" },

  // session row
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  sessionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionAvatarTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sessionUserName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  sessionTopic: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  sessionTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sessionTimeTxt: { fontSize: 12, fontWeight: "600", color: "#0FA688" },
  waitingBadge: {
    backgroundColor: "rgb(113, 149, 255)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    alignItems: "center",
  },
  waitingTxt: { fontSize: 11, color: "#D97706", fontWeight: "600" },
  joinBtn: {
    backgroundColor: "#0FA688",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
  },
  joinTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // chat row
  chatRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  chatAvatarTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  chatName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  chatMsg: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  chatTime: { fontSize: 11, color: "#9CA3AF" },
  chatAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0FA688",
    marginTop: 3,
  },

  // earnings cards
  earnCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  earnCard: { flex: 1, borderRadius: 14, padding: 16 },
  earnCardLabel: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  earnCardValue: { fontSize: 22, fontWeight: "800" },

  // transaction row
  txnSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 16,
    marginTop: -2,
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  txnAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  txnAvatarTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  txnUserName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  txnTopic: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  txnDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: "800", color: "#0FA688" },
  txnStatusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  txnStatusTxt: { fontSize: 11, fontWeight: "600" },

  // ── shared original styles ──
  scrollContainer: { paddingBottom: 40 },
  promoBanner: {
    backgroundColor: "rgb(228, 235, 255)",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    marginBottom: 25,
  },
  promoTextContainer: { flex: 1 },
  promoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    lineHeight: 22,
  },
  promoSub: { fontSize: 18, fontWeight: "700", color: "#333", marginTop: 8 },
  askExpertBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgb(113, 149, 255)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  askExpertBtnText: {
    color: "rgb(92, 132, 251)",
    fontSize: 12,
    fontWeight: "600",
  },
  promoImage: { width: 150, height: 130, borderRadius: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "rgb(90, 91, 93)",
  },
  viewAllText: { color: "rgb(113, 149, 255)", fontSize: 17, fontWeight: "600" },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginRight: 5,
  },
  liveIndicatorText: { color: "red", fontSize: 12, fontWeight: "700" },
  noExpertsText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 20,
    fontSize: 14,
  },
  expertBySkillList: { paddingLeft: 16, paddingBottom: 10 },
  skillExpertCard: {
    width: 140,
    backgroundColor: "#F3F0FF",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    marginRight: 15,
   paddingLeft: 16, paddingBottom: 10 ,
  },
  expertInitialCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgb(113, 149, 255)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  expertInitialText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  expertCardName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  starRow: { flexDirection: "row", marginBottom: 4 },
  expText: { fontSize: 11, color: "#666", marginBottom: 6 },
  skillChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
  },
  expertSkillBadge: {
    backgroundColor: "rgb(113, 149, 255)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 2,
  },
  expertSkillText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  expertCardFooter: {
    height: 4,
    width: 60,
    backgroundColor: "#DDD",
    borderRadius: 2,
    marginTop: 8,
  },
  liveScrollContainer: { paddingLeft: 16, paddingBottom: 10 },
  liveCard: {
    width: 150,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "rgb(113, 149, 255)",
  },
  liveImage: { width: "100%", height: "100%" },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  liveOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  liveName: { color: "#fff", fontWeight: "700", fontSize: 12 },
  liveTitle: { color: "#fff", fontSize: 10 },
  filterList: { paddingLeft: 16, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgb(113, 149, 255)",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  filterChipActive: { backgroundColor: "rgb(164, 187, 255)" },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#2c2b2b" },
  filterChipTextActive: { color: "#3e3d3d" },
  emptyTxt: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },

  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "40%",
    elevation: 2,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0FA688",
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: "#0FA688",
  },

  tabText: {
    color: "#777",
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  txnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  txnUser: {
    fontWeight: "600",
  },

  txnDate: {
    fontSize: 12,
    color: "#888",
  },

  txnAmount: {
    fontWeight: "700",
    color: "#0FA688",
  },
});
