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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../services/api";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WalletModal from "../../../components/WalletModal";

const BASE_URL = "http://192.168.1.19:3000";

const SKILLS = [
  "All",
  "React",
  "Python",
  "DevOps",
  "Angular",
  "Java Spring Boot",
  "UI/UX Design",
  "Data Analysis",
];

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

const LANGUAGE_FILTERS = [
  "All",
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Punjabi",
  "Urdu",
];

const CERTIFICATION_FILTERS = [
  "All",
  "AWS",
  "Google Cloud",
  "Microsoft Azure",
  "PMP",
  "Scrum Master",
  "CISSP",
  "CPA",
  "CFA",
  "MBA",
  "PhD",
];

export default function Dashboard() {
  const [onlineExperts, setOnlineExperts] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(true);
  // ✅ KEPT: topExperts state kept but Top Experts UI section removed as requested
  const [topExperts, setTopExperts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [activeSkill, setActiveSkill] = useState("All");
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  const [activeSkillFilter, setActiveSkillFilter] = useState("All");
  const [skillFilteredExperts, setSkillFilteredExperts] = useState([]);
  const [loadingSkillFilter, setLoadingSkillFilter] = useState(false);

  // ✅ FIXED: kept state but removed useEffect triggers for hidden sections
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [languageExperts, setLanguageExperts] = useState([]);
  const [loadingLanguage, setLoadingLanguage] = useState(false);

  const [activeCertification, setActiveCertification] = useState("All");
  const [certificationExperts, setCertificationExperts] = useState([]);
  const [loadingCertification, setLoadingCertification] = useState(false);

  const [walletVisible, setWalletVisible] = useState(false);

  const socketRef = useRef(null);
  const expertIdRef = useRef(null);
  // ✅ FIXED: guard to prevent socket from being created multiple times
  const socketInitialized = useRef(false);

  useEffect(() => {
    // ✅ FIX: fetchOnlineExperts is called AFTER expert:online is acknowledged
    // so we only call it here for non-expert users (users browsing the app)
    fetchTopExperts();

    // ✅ FIXED: prevent duplicate socket connections
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    const setupSocket = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        // ✅ FIXED: log only once, not on every reconnect
        console.log("👤 User from storage:", user);
        console.log("👤 User role:", user?.role);

        socketRef.current = io(BASE_URL, {
          transports: ["websocket"],
          reconnectionAttempts: 3, // ✅ FIXED: limit to 3 attempts only
          reconnectionDelay: 3000, // ✅ FIXED: wait 3s between attempts
          timeout: 10000, // ✅ FIXED: 10s timeout
          autoConnect: true,
        });

        socketRef.current.on("connect", () => {
          console.log("✅ Socket connected:", socketRef.current.id);
          if (user?.id) {
            const role = (user.role || "").toLowerCase();
            if (role === "expert") {
              expertIdRef.current = user.id;
              socketRef.current.emit("expert:online", user.id);
              console.log("🟢 Emitted expert:online for userId:", user.id);

              // ✅ KEY FIX: Wait a short moment for DB to update, then fetch
              // This ensures is_online=true is saved before we query /experts/online
              setTimeout(() => {
                fetchOnlineExperts();
              }, 500);
            } else {
              // Non-expert user: fetch immediately, no DB update needed
              fetchOnlineExperts();
            }
          } else {
            // No user / not logged in: fetch immediately
            fetchOnlineExperts();
          }
        });

        socketRef.current.on("expert:status", ({ expertId, is_online }) => {
          if (is_online) {
            setOnlineExperts((prev) => {
              const alreadyExists = prev.find((e) => e.id === expertId);
              if (!alreadyExists) fetchOnlineExperts();
              return prev;
            });
          } else {
            setOnlineExperts((prev) => prev.filter((e) => e.id !== expertId));
          }
        });

        socketRef.current.on("disconnect", () => {
          console.log("🔌 Socket disconnected");
        });

        // ✅ FIXED: log error only once, no infinite retry logs
        socketRef.current.on("connect_error", (err) => {
          console.log("❌ Socket error (will retry max 3x):", err.message);
          // ✅ FIX: Still fetch online experts even if socket fails
          fetchOnlineExperts();
        });

        // ✅ FIXED: stop retrying after max attempts
        socketRef.current.io.on("reconnect_failed", () => {
          console.log("⛔ Socket gave up reconnecting after 3 attempts");
        });
      } catch (err) {
        console.log("Socket setup error:", err);
        // ✅ FIX: Fallback fetch if socket setup itself throws
        fetchOnlineExperts();
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        if (expertIdRef.current) {
          socketRef.current.emit("expert:offline", expertIdRef.current);
          console.log(
            "🔴 Emitted expert:offline for userId:",
            expertIdRef.current,
          );
        }
        socketRef.current.disconnect();
        socketRef.current = null; // ✅ FIXED: clean up ref
        socketInitialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    fetchFilteredExperts(activeSkill);
  }, [activeSkill]);

  useEffect(() => {
    fetchExpertsBySkillFilter(activeSkillFilter);
  }, [activeSkillFilter]);

  // ✅ FIXED: removed useEffect for language & certification
  // They are inside {false && ...} blocks so no need to fetch at all
  // fetchExpertsByLanguage and fetchExpertsByCertification kept for future use

  const getInitials = (name) => {
    if (!name) return "EX";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

  const fetchFilteredExperts = async (skill) => {
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

  // ✅ Kept for future use when language section is enabled
  const fetchExpertsByLanguage = async (language) => {
    try {
      setLoadingLanguage(true);
      const res = await axiosInstance.get("/experts");
      const list = res?.data?.data || [];
      const normalized = list.map((e) => ({
        ...e,
        rating: parseFloat(e.rating) || 0,
        experience: parseInt(e.experience) || 0,
      }));
      const filtered =
        language === "All"
          ? normalized
          : normalized.filter(
              (e) =>
                e.language_spoken &&
                e.language_spoken
                  .toLowerCase()
                  .includes(language.toLowerCase()),
            );
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setLanguageExperts(filtered);
    } catch {
      setLanguageExperts([]);
    } finally {
      setLoadingLanguage(false);
    }
  };

  // ✅ Kept for future use when certification section is enabled
  const fetchExpertsByCertification = async (cert) => {
    try {
      setLoadingCertification(true);
      const res = await axiosInstance.get("/experts");
      const list = res?.data?.data || [];
      const normalized = list.map((e) => ({
        ...e,
        rating: parseFloat(e.rating) || 0,
        experience: parseInt(e.experience) || 0,
      }));
      const filtered =
        cert === "All"
          ? normalized
          : normalized.filter(
              (e) =>
                e.certification &&
                e.certification.toLowerCase().includes(cert.toLowerCase()),
            );
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setCertificationExperts(filtered);
    } catch {
      setCertificationExperts([]);
    } finally {
      setLoadingCertification(false);
    }
  };

  const getImageUri = (image, name) => {
    if (image) return `${BASE_URL}/uploads/${image}`;
    return `https://ui-avatars.com/api/?name=${name || "User"}&background=1A2B4C&color=fff`;
  };

  const getFirstSkill = (expert) => {
    if (Array.isArray(expert.skills) && expert.skills.length > 0) {
      return expert.skills[0].skill_name;
    }
    return expert.domain || expert.role || "Expert";
  };

  const getSkillChips = (expert) => {
    if (Array.isArray(expert.skills) && expert.skills.length > 0) {
      return expert.skills.slice(0, 2).map((s) => s.skill_name);
    }
    return expert.domain ? [expert.domain] : [];
  };

  const ExpertCard = ({ e }) => (
    <Pressable
      style={styles.skillExpertCard}
      onPress={() => router.push(`/expert/${e.id}`)}>
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
        {[1, 2, 3, 4, 5].map((s) => {
          const ratingVal = Math.round(e.rating || 0);
          return (
            <Ionicons
              key={s}
              name={s <= ratingVal ? "star" : "star-outline"}
              size={14}
              color="#FBBF24"
            />
          );
        })}
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
          <Text style={styles.avatarInitial}>C</Text>
        </View>
        <Text style={styles.headerTitle}>Career-Talk</Text>
        <TouchableOpacity
          style={styles.addCashBtn}
          onPress={() => setWalletVisible(true)}>
          <Text style={styles.addCashText}>Add Cash +</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <Pressable
        style={styles.searchBar}
        onPress={() => router.push("/expert/search")}>
        <Ionicons name="search" size={20} color="#C4C4C4" />
        <Text style={styles.searchText}>Search</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
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
            contentContainerStyle={styles.liveScrollContainer}>
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
          contentContainerStyle={styles.filterList}>
          {SKILL_FILTERS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.filterChip,
                activeSkillFilter === skill && styles.filterChipActive,
              ]}
              onPress={() => setActiveSkillFilter(skill)}>
              <Text
                style={[
                  styles.filterChipText,
                  activeSkillFilter === skill && styles.filterChipTextActive,
                ]}>
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
            contentContainerStyle={styles.expertBySkillList}>
            {skillFilteredExperts.map((e) => (
              <ExpertCard key={e.id} e={e} />
            ))}
          </ScrollView>
        )}

        {/* BROWSE BY LANGUAGE — hidden, kept for future */}
        {false && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse by Language</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}>
              {LANGUAGE_FILTERS.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.filterChip,
                    styles.filterChipGreen,
                    activeLanguage === lang && styles.filterChipGreenActive,
                  ]}
                  onPress={() => setActiveLanguage(lang)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: activeLanguage === lang ? "#fff" : "#1a7a4a" },
                    ]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {loadingLanguage ? (
              <ActivityIndicator
                color="#0B2D72"
                style={{ marginVertical: 20 }}
              />
            ) : languageExperts.length === 0 ? (
              <Text style={styles.noExpertsText}>
                No experts found for this language
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.expertBySkillList}>
                {languageExperts.map((e) => (
                  <ExpertCard key={e.id} e={e} />
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* BROWSE BY CERTIFICATION — hidden, kept for future */}
        {false && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse by Certification</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}>
              {CERTIFICATION_FILTERS.map((cert) => (
                <TouchableOpacity
                  key={cert}
                  style={[
                    styles.filterChip,
                    styles.filterChipOrange,
                    activeCertification === cert &&
                      styles.filterChipOrangeActive,
                  ]}
                  onPress={() => setActiveCertification(cert)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          activeCertification === cert ? "#fff" : "#b45309",
                      },
                    ]}>
                    {cert}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {loadingCertification ? (
              <ActivityIndicator
                color="#0B2D72"
                style={{ marginVertical: 20 }}
              />
            ) : certificationExperts.length === 0 ? (
              <Text style={styles.noExpertsText}>
                No experts found for this certification
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.expertBySkillList}>
                {certificationExperts.map((e) => (
                  <ExpertCard key={e.id} e={e} />
                ))}
              </ScrollView>
            )}
          </>
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
          contentContainerStyle={styles.scrollContainer}>
          {loadingFiltered ? (
            <ActivityIndicator color="#0B2D72" style={{ marginVertical: 20 }} />
          ) : (
            filteredExperts.map((e) => (
              <Pressable
                key={e.id}
                style={styles.skillExpertCard}
                onPress={() => router.push(`/expert/${e.id}`)}>
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
                  {[1, 2, 3, 4, 5].map((s) => {
                    const ratingVal = Math.round(e.rating || 0);
                    return (
                      <Ionicons
                        key={s}
                        name={s <= ratingVal ? "star" : "star-outline"}
                        size={14}
                        color="#FBBF24"
                      />
                    );
                  })}
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

        {/* TOP EXPERTS — hidden, kept for future use */}
        {false && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Experts</Text>
            </View>
            {loadingTop ? (
              <ActivityIndicator color="#0B2D72" />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topExpertsList}>
                {topExperts.map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    style={styles.circularExpertContainer}
                    onPress={() => router.push(`/expert/${e.id}`)}>
                    <View style={styles.goldBorder}>
                      {e.image ? (
                        <Image
                          source={{ uri: getImageUri(e.image, e.name) }}
                          style={{ width: 58, height: 58, borderRadius: 29 }}
                        />
                      ) : (
                        <View style={styles.innerCircle}>
                          <Text style={styles.circleInitial}>
                            {getInitials(e.name)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.circleExpertName} numberOfLines={1}>
                      {e.name?.split(" ")[0]}
                    </Text>
                    <Text style={styles.circleExpertSkill} numberOfLines={1}>
                      {getFirstSkill(e)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </ScrollView>

      {/* WALLET MODAL */}
      <WalletModal
        visible={walletVisible}
        onClose={() => setWalletVisible(false)}
      />
    </SafeAreaView>
  );
}

const LiveExpert = ({ name, title, image, onPress }) => (
  <Pressable style={styles.liveCard} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.liveImage} />
    <View style={styles.liveBadge}>
      <Text style={styles.liveText}>LIVE</Text>
    </View>
    <View style={styles.liveOverlay}>
      <Text style={styles.liveName}>{name}</Text>
      <Text style={styles.liveTitle}>{title}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
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
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    color: "#333",
  },
  addCashBtn: {
    marginLeft: "auto",
    backgroundColor: "#0B2D72",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addCashText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginHorizontal: 16,
    marginBottom: 15,
  },
  searchText: { color: "#0B2D72", marginLeft: 8, fontSize: 16 },
  scrollContainer: { paddingBottom: 40 },
  promoBanner: {
    backgroundColor: "#ffeda6",
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
    borderColor: "#0B2D72",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  askExpertBtnText: { color: "#0B2D72", fontSize: 10, fontWeight: "600" },
  promoImage: { width: 150, height: 130, borderRadius: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 24, fontWeight: "700", color: "#333" },
  viewAllText: { color: "#0B2D72", fontSize: 20, fontWeight: "600" },
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
  },
  expertInitialCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0B2D72",
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
    backgroundColor: "#0B2D72",
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
  // ✅ KEPT: Top Experts styles preserved for future use
  topExpertsList: { paddingLeft: 16, paddingBottom: 10 },
  circularExpertContainer: { marginRight: 15, alignItems: "center", width: 70 },
  goldBorder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  innerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B2D72",
    justifyContent: "center",
    alignItems: "center",
  },
  circleInitial: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  circleExpertName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
  },
  circleExpertSkill: { fontSize: 10, color: "#666", textAlign: "center" },
  liveScrollContainer: { paddingLeft: 16, paddingBottom: 10 },
  liveCard: {
    width: 150,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#eee",
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
    borderColor: "#0B2D72",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  filterChipActive: { backgroundColor: "#0B2D72" },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#0B2D72" },
  filterChipTextActive: { color: "#fff" },
  filterChipGreen: { borderColor: "#1a7a4a", backgroundColor: "#fff" },
  filterChipGreenActive: { backgroundColor: "#1a7a4a" },
  filterChipOrange: { borderColor: "#b45309", backgroundColor: "#fff" },
  filterChipOrangeActive: { backgroundColor: "#b45309" },
});
