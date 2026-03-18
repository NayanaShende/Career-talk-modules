import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import axiosInstance from "../../services/api";
import { router } from "expo-router";

const { height } = Dimensions.get("window");

// ── Design tokens ──────────────────────────────────────────────────────────
const TEAL = "#867795";
const TEAL_MID = "#867795";
const TEAL_LIGHT = "#e4f0ed";
const TEAL_TEXT = "#867795";
const GREEN_DARK = "#867795";
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const TEXT_1 = "#1a1a2e";
const TEXT_2 = "#6b7280";
const BORDER = "#e5e7eb";

const BASE_URL = "http://192.168.1.25:3000";
const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function WalletModal({ visible, onClose }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("topup");
  const [userData, setUserData] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txDetailVisible, setTxDetailVisible] = useState(false);

  const isTabMode = visible === undefined;

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTabMode) {
      loadUserAndBalance();
      return;
    }
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
      loadUserAndBalance();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ── Load user + balance + history ─────────────────────────────────────────
  const loadUserAndBalance = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
        setUserId(user.id);
        setUserData(user);

        try {
          const token = await AsyncStorage.getItem("token");
          if (token) {
            const res = await axios.get(`${BASE_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const apiUser = res?.data?.user;
            if (apiUser) {
              setUserData({
                ...user,
                ...apiUser,
                fullName:
                  apiUser.fullName ||
                  apiUser.full_name ||
                  apiUser.name ||
                  user.fullName ||
                  user.name,
                image: apiUser.image || user.image,
              });
            }
          }
        } catch (apiErr) {
          console.log("wallet user fetch error:", apiErr.message);
        }

        await fetchBalance(user.id);
        await fetchHistory(user.id);
      }
    } catch (e) {
      console.log("loadUserAndBalance error:", e);
    }
  };

  const fetchBalance = async (uid) => {
    try {
      setLoadingBalance(true);
      const res = await axiosInstance.get(`/wallet/balance/${uid}`);
      setBalance(res?.data?.balance || 0);
    } catch (e) {
      console.log("fetchBalance error:", e);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchHistory = async (uid) => {
    try {
      const res = await axiosInstance.get(`/wallet/history/${uid}`);
      setTransactions(res?.data || []);
    } catch (e) {
      console.log("fetchHistory error:", e);
    }
  };

  // ── Add money / Razorpay ───────────────────────────────────────────────────
  const handleAddMoney = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 1) {
      Alert.alert("Invalid Amount", "Please enter a valid amount (min ₹1)");
      return;
    }
    if (amt > 50000) {
      Alert.alert("Limit Exceeded", "Maximum topup amount is ₹50,000");
      return;
    }
    try {
      setLoading(true);
      const orderRes = await axiosInstance.post("/payment/create-order", {
        amount: amt,
      });
      const order = orderRes?.data?.order;
      if (!order?.id) throw new Error("Order creation failed");

      Alert.alert(
        "Payment",
        `Order created for ₹${amt}.\nOrder ID: ${order.id}\n\nIn production, integrate react-native-razorpay SDK here.`,
        [
          {
            text: "Simulate Success (Test)",
            onPress: () => simulatePaymentSuccess(order.id, amt),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } catch (e) {
      console.log("handleAddMoney error:", e);
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Payment failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async (orderId, amt) => {
    try {
      setLoading(true);
      await axiosInstance.post("/wallet/topup", { userId, amount: amt });
      await fetchBalance(userId);
      await fetchHistory(userId);
      setAmount("");
      setActiveTab("history");
      Alert.alert("Success", `₹${amt} added to your wallet!`);
    } catch (e) {
      Alert.alert("Error", "Topup failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getTransactionIcon = (type) => {
    switch (type) {
      case "topup":
        return { icon: "arrow-down-circle", color: "#10b981" };
      case "debit":
        return { icon: "arrow-up-circle", color: "#ef4444" };
      case "hold":
        return { icon: "pause-circle", color: "#f59e0b" };
      case "release":
        return { icon: "refresh-circle", color: "#3b82f6" };
      case "refund":
        return { icon: "return-down-back", color: "#8b5cf6" };
      default:
        return { icon: "ellipse", color: "#6b7280" };
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case "topup":
        return "Money Added";
      case "debit":
        return "Money Debited";
      case "hold":
        return "On Hold";
      case "release":
        return "Released";
      case "refund":
        return "Refunded";
      default:
        return type;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── User avatar helpers ────────────────────────────────────────────────────
  const getUserAvatarUri = () => {
    const img = userData?.image || userData?.profileImage || userData?.avatar;
    if (img && img !== "null" && img !== "undefined" && img !== "") {
      if (img.startsWith("http")) return img;
      const clean = img.replace(/^uploads\//, "");
      return `${BASE_URL}/uploads/${clean}`;
    }
    const name = getUserDisplayName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f5c4f&color=fff&size=128`;
  };

  const getUserDisplayName = () => {
    return (
      userData?.fullName ||
      userData?.full_name ||
      userData?.name ||
      userData?.userName ||
      userData?.username ||
      userData?.firstName ||
      userData?.displayName ||
      "User"
    );
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .trim()
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // ── User card ──────────────────────────────────────────────────────────────
  const UserCard = () => (
    <View style={styles.userCard}>
      <View style={styles.userAvatarWrap}>
        <Image
          source={{ uri: getUserAvatarUri() }}
          style={styles.userAvatar}
          onError={() => {}}
        />
        <View style={styles.userAvatarBadge}>
          <Ionicons name="checkmark" size={9} color="#fff" />
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{getUserDisplayName()}</Text>
        <Text style={styles.userSubtitle}>Career-Talk Wallet</Text>
      </View>
      <TouchableOpacity
        style={styles.refreshIconBtn}
        onPress={() => userId && loadUserAndBalance()}>
        <Ionicons name="refresh-outline" size={18} color={GREEN_DARK} />
      </TouchableOpacity>
    </View>
  );

  // ── Balance card ───────────────────────────────────────────────────────────
  // FIX: BalanceCard was completely broken — it contained TransactionDetailModal
  // JSX mixed inside it. Restored it as a clean standalone component.
  const BalanceCard = () => (
    <View style={styles.balanceCard}>
      <View style={styles.balanceCardBg} />
      <View style={styles.balanceInner}>
        <View>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {loadingBalance ? (
            <ActivityIndicator
              color="#fff"
              size="small"
              style={{ marginTop: 6 }}
            />
          ) : (
            <Text style={styles.balanceAmount}>
              ₹{parseFloat(balance).toFixed(2)}
            </Text>
          )}
        </View>
        <View style={styles.balanceIconWrap}>
          <Ionicons name="wallet" size={28} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      {/* Paying info strip */}
      {userData && (
        <View style={styles.payingStrip}>
          <Ionicons
            name="person-circle-outline"
            size={14}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.payingText}>
            Paying as{" "}
            <Text style={{ fontWeight: "800" }}>{getUserDisplayName()}</Text>
          </Text>
        </View>
      )}
    </View>
  );

  // ── Transaction Detail Modal ───────────────────────────────────────────────
  // FIX: extracted TransactionDetailModal as its own proper component
  const TransactionDetailModal = () => {
    if (!selectedTx) return null;
    const { icon, color } = getTransactionIcon(selectedTx.type);
    const isCredit = ["topup", "refund", "release"].includes(selectedTx.type);
    return (
      <Modal
        visible={txDetailVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTxDetailVisible(false)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailSheet}>
            {/* Header */}
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setTxDetailVisible(false)}>
                <Ionicons name="close" size={22} color={TEXT_2} />
              </TouchableOpacity>
              <Text style={styles.detailTitle}>Transaction Detail</Text>
              <View style={{ width: 22 }} />
            </View>

            {/* Amount */}
            <View style={styles.detailAmountWrap}>
              <View style={[styles.detailIconCircle, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={32} color={color} />
              </View>
              <Text style={[styles.detailAmount, { color: isCredit ? "#10b981" : "#ef4444" }]}>
                {isCredit ? "+" : "-"}₹{parseFloat(selectedTx.amount).toFixed(2)}
              </Text>
              <Text style={styles.detailType}>
                {getTransactionLabel(selectedTx.type)}
              </Text>
            </View>

            {/* Detail rows */}
            <View style={styles.detailBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>Date</Text>
                <Text style={styles.detailRowValue}>
                  {formatDate(selectedTx.created_at)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>Type</Text>
                <View
                  style={[styles.detailBadge, { backgroundColor: color + "20" }]}>
                  <Text style={[styles.detailBadgeText, { color: color }]}>
                    {selectedTx.type.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>Currency</Text>
                <Text style={styles.detailRowValue}>
                  {selectedTx.currency || "INR"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>Status</Text>
                <View
                  style={[styles.detailBadge, { backgroundColor: "#e8f5e9" }]}>
                  <Text style={[styles.detailBadgeText, { color: "#27ae60" }]}>
                    COMPLETED
                  </Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailRowLabel}>Transaction ID</Text>
                <Text
                  style={[
                    styles.detailRowValue,
                    { fontSize: 10, color: "#aaa", maxWidth: "55%" },
                  ]}
                  numberOfLines={2}>
                  {selectedTx.id}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={() => setTxDetailVisible(false)}>
              <Text style={styles.detailCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Tab switcher ───────────────────────────────────────────────────────────
  // FIX: TouchableOpacity was missing closing > before its children
  const TabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: "topup", icon: "add-circle-outline", label: "Add Money" },
        { key: "history", icon: "time-outline", label: "History" },
      ].map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
          onPress={() => setActiveTab(t.key)}>
          <Ionicons
            name={t.icon}
            size={16}
            color={activeTab === t.key ? "#fff" : TEAL}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === t.key && styles.tabBtnTextActive,
            ]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Add Money tab ──────────────────────────────────────────────────────────
  // FIX: removed duplicate style array on the add button
  const TopupTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={styles.sectionLabel}>Quick Add</Text>
      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((qa) => (
          <TouchableOpacity
            key={qa}
            style={[
              styles.quickBtn,
              amount === String(qa) && styles.quickBtnActive,
            ]}
            onPress={() => setAmount(String(qa))}>
            <Text
              style={[
                styles.quickBtnText,
                amount === String(qa) && styles.quickBtnTextActive,
              ]}>
              ₹{qa}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Enter Amount</Text>
      <View style={styles.inputRow}>
        <View style={styles.rupeeBox}>
          <Text style={styles.rupeeSign}>₹</Text>
        </View>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          maxLength={6}
        />
      </View>

      {/* Paying as row */}
      {userData && (
        <View style={styles.payingRow}>
          <Image
            source={{ uri: getUserAvatarUri() }}
            style={styles.payingAvatar}
          />
          <Text style={styles.payingRowText}>
            Adding to{" "}
            <Text style={styles.payingRowName}>{getUserDisplayName()}'s</Text>{" "}
            wallet
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addBtn, (!amount || loading) && styles.addBtnDisabled]}
        onPress={handleAddMoney}
        disabled={!amount || loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addBtnText}>
              Add ₹{amount || "0"} to Wallet
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.secureBox}>
        <View style={styles.secureIconWrap}>
          <Ionicons name="shield-checkmark" size={16} color={TEAL} />
        </View>
        <Text style={styles.secureText}>
          Payments secured by Razorpay. Amount will be credited instantly.
        </Text>
      </View>
    </ScrollView>
  );

  // ── History tab ────────────────────────────────────────────────────────────
  // FIX: removed misplaced TouchableOpacity open/close fragments that were
  // orphaned inside the map, and fixed broken ref/from_user_name Text tags
  const HistoryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      {transactions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="receipt-outline" size={32} color={TEAL} />
          </View>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySub}>Add money to get started</Text>
        </View>
      ) : (
        transactions.map((tx) => {
          const { icon, color } = getTransactionIcon(tx.type);
          const isCredit = ["topup", "refund", "release"].includes(tx.type);
          return (
            <TouchableOpacity
              key={tx.id}
              style={styles.txRow}
              onPress={() => {
                setSelectedTx(tx);
                setTxDetailVisible(true);
              }}
              activeOpacity={0.7}>
              <View
                style={[styles.txIconWrap, { backgroundColor: color + "18" }]}>
                <Ionicons name={icon} size={22} color={color} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txLabel}>
                  {getTransactionLabel(tx.type)}
                </Text>
                <Text style={styles.txDate}>{formatDate(tx.created_at)}</Text>
                {tx.ref_id && (
                  <Text style={styles.txRef} numberOfLines={1}>
                    Ref: {tx.ref_id}
                  </Text>
                )}
                {tx.from_user_name && (
                  <Text style={styles.txRef} numberOfLines={1}>
                    From: {tx.from_user_name}
                  </Text>
                )}
              </View>
              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: isCredit ? "#10b981" : "#ef4444" },
                  ]}>
                  {isCredit ? "+" : "-"}₹{parseFloat(tx.amount).toFixed(2)}
                </Text>
                <View
                  style={[
                    styles.txTypePill,
                    { backgroundColor: color + "18" },
                  ]}>
                  <Text style={[styles.txTypePillText, { color }]}>
                    {getTransactionLabel(tx.type)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  // ── Wallet content (shared) ────────────────────────────────────────────────
  const WalletContent = () => (
    <>
      <UserCard />
      <BalanceCard />
      <TabBar />
      {activeTab === "topup" ? <TopupTab /> : <HistoryTab />}
    </>
  );

  // ── TAB MODE ───────────────────────────────────────────────────────────────
  if (isTabMode) {
    return (
      <SafeAreaView style={styles.tabContainer}>
        <StatusBar backgroundColor={TEAL} barStyle="light-content" />
        <View style={styles.tabHeader}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <Text style={styles.headerSub}>Career-Talk Balance</Text>
          </View>
          <TouchableOpacity
            style={styles.headerRefreshBtn}
            onPress={() => userId && loadUserAndBalance()}>
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.tabContent}
          showsVerticalScrollIndicator={false}>
          <WalletContent />
        </ScrollView>
        <TransactionDetailModal />
      </SafeAreaView>
    );
  }

  // ── MODAL MODE ─────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetHeaderTitle}>My Wallet</Text>
            <Text style={styles.sheetHeaderSub}>Career-Talk Balance</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={TEXT_2} />
          </TouchableOpacity>
        </View>
        <WalletContent />
      </Animated.View>

      <TransactionDetailModal />
    </Modal>
  );
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Tab mode ──
  // FIX: tabContainer was missing its opening brace
  tabContainer: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  tabHeader: {
    backgroundColor: GREEN_DARK,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginTop:22,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "500",
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerRefreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },

  // ── Modal mode ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.88,
    backgroundColor: PAGE_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },
  // FIX: sheetHeaderTitle, sheetHeaderSub, closeBtn were broken/missing braces
  sheetHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_1,
    letterSpacing: -0.2,
  },
  sheetHeaderSub: {
    fontSize: 13,
    color: TEXT_2,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f3",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── User card ──
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
    gap: 12,
  },
  userAvatarWrap: {
    position: "relative",
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
  },
  userAvatarBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: GREEN_DARK,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: CARD_BG,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_1,
    letterSpacing: -0.1,
  },
  userSubtitle: {
    fontSize: 12,
    color: TEXT_2,
    marginTop: 2,
    fontWeight: "500",
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ede8f0",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Balance card ──
  balanceCard: {
    backgroundColor: GREEN_DARK,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: GREEN_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  balanceCardBg: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  balanceInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  balanceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  payingStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
  },
  payingText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },

  // ── Tab bar ──
  tabBar: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: GREEN_DARK,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN_DARK,
  },
  tabBtnTextActive: {
    color: "#fff",
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // ── Quick amounts ──
  quickRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN_DARK,
    alignItems: "center",
    backgroundColor: CARD_BG,
  },
  quickBtnActive: {
    backgroundColor: GREEN_DARK,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN_DARK,
  },
  quickBtnTextActive: {
    color: "#fff",
  },

  // ── Amount input ──
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginBottom: 14,
    overflow: "hidden",
    height: 58,
  },
  rupeeBox: {
    width: 50,
    height: "100%",
    backgroundColor: TEAL_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  rupeeSign: {
    fontSize: 20,
    fontWeight: "800",
    color: TEAL,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_1,
    paddingHorizontal: 16,
  },

  // ── Paying row ──
  payingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0ecf3",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd5e4",
  },
  payingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  payingRowText: {
    fontSize: 13,
    color: GREEN_DARK,
    fontWeight: "500",
  },
  payingRowName: {
    fontWeight: "800",
    color: GREEN_DARK,
  },

  // ── Add button ──
  addBtn: {
    backgroundColor: GREEN_DARK,
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: GREEN_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  addBtnDisabled: {
    backgroundColor: "#c4c4cc",
    elevation: 0,
    shadowOpacity: 0,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  // ── Secure box ──
  secureBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0ecf3",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd5e4",
  },
  secureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  secureText: {
    flex: 1,
    fontSize: 12,
    color: GREEN_DARK,
    lineHeight: 18,
    fontWeight: "500",
  },

  // ── Empty state ──
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0ecf3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
  },
  emptySub: {
    fontSize: 13,
    color: TEXT_2,
  },

  // ── Transaction row ──
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
    gap: 12,
  },
  txIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_1,
  },
  txDate: {
    fontSize: 11,
    color: TEXT_2,
    marginTop: 2,
  },
  txRef: {
    fontSize: 10,
    color: "#bbb",
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
    gap: 5,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
  txTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  txTypePillText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // ── Transaction detail modal ──
  // FIX: these styles were orphaned fragments; restored as proper objects
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  detailSheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_1,
  },
  detailAmountWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  detailAmount: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  detailType: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  detailBody: {
    backgroundColor: "#f8f9ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8eeff",
  },
  detailRowLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
  detailRowValue: {
    fontSize: 13,
    color: "#1a1a2e",
    fontWeight: "700",
    textAlign: "right",
  },
  detailBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  detailCloseBtn: {
    backgroundColor: "#0B2D72",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  detailCloseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});