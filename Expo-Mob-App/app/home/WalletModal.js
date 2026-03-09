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
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../services/api";

const { height } = Dimensions.get("window");

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function WalletModal({ visible, onClose }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("topup"); // "topup" | "history"

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
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
      // Animate out
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

  const loadUserAndBalance = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
        setUserId(user.id);
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

      // Step 1: Create Razorpay order
      const orderRes = await axiosInstance.post("/payment/create-order", {
        amount: amt,
      });

      const order = orderRes?.data?.order;
      if (!order?.id) throw new Error("Order creation failed");

      // Step 2: Open Razorpay checkout
      // Since this is a mobile app, we use Razorpay's payment link or
      // redirect to a web checkout page
      const checkoutUrl = `https://api.razorpay.com/v1/checkout/embedded`;

      Alert.alert(
        "Payment",
        `Order created for ₹${amt}.\nOrder ID: ${order.id}\n\nIn production, integrate react-native-razorpay SDK here.`,
        [
          {
            text: "Simulate Success (Test)",
            onPress: () => simulatePaymentSuccess(order.id, amt),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } catch (e) {
      console.log("handleAddMoney error:", e);
      Alert.alert("Error", e?.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ For testing only — simulates wallet topup directly
  const simulatePaymentSuccess = async (orderId, amt) => {
    try {
      setLoading(true);
      // Direct wallet topup for testing
      await axiosInstance.post("/wallet/topup", {
        userId: userId,
        amount: amt,
      });
      await fetchBalance(userId);
      await fetchHistory(userId);
      setAmount("");
      setActiveTab("history");
      Alert.alert("✅ Success", `₹${amt} added to your wallet!`);
    } catch (e) {
      Alert.alert("Error", "Topup failed");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "topup": return { icon: "arrow-down-circle", color: "#10b981" };
      case "debit": return { icon: "arrow-up-circle", color: "#ef4444" };
      case "hold": return { icon: "pause-circle", color: "#f59e0b" };
      case "release": return { icon: "refresh-circle", color: "#3b82f6" };
      case "refund": return { icon: "return-down-back", color: "#8b5cf6" };
      default: return { icon: "ellipse", color: "#6b7280" };
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case "topup": return "Money Added";
      case "debit": return "Money Debited";
      case "hold": return "On Hold";
      case "release": return "Released";
      case "refund": return "Refunded";
      default: return type;
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <Text style={styles.headerSub}>Career Talk Balance</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLeft}>
            <Ionicons name="wallet-outline" size={28} color="#fff" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              {loadingBalance ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.balanceAmount}>₹{parseFloat(balance).toFixed(2)}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => userId && fetchBalance(userId)}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "topup" && styles.tabActive]}
            onPress={() => setActiveTab("topup")}
          >
            <Ionicons
              name="add-circle-outline"
              size={16}
              color={activeTab === "topup" ? "#fff" : "#0B2D72"}
            />
            <Text style={[styles.tabText, activeTab === "topup" && styles.tabTextActive]}>
              Add Money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
            onPress={() => setActiveTab("history")}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={activeTab === "history" ? "#fff" : "#0B2D72"}
            />
            <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "topup" ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Quick Amount Buttons */}
            <Text style={styles.sectionLabel}>Quick Add</Text>
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((qa) => (
                <TouchableOpacity
                  key={qa}
                  style={[
                    styles.quickBtn,
                    amount === String(qa) && styles.quickBtnActive,
                  ]}
                  onPress={() => setAmount(String(qa))}
                >
                  <Text
                    style={[
                      styles.quickBtnText,
                      amount === String(qa) && styles.quickBtnTextActive,
                    ]}
                  >
                    ₹{qa}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount Input */}
            <Text style={styles.sectionLabel}>Enter Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                maxLength={6}
              />
            </View>

            {/* Add Money Button */}
            <TouchableOpacity
              style={[styles.addBtn, (!amount || loading) && styles.addBtnDisabled]}
              onPress={handleAddMoney}
              disabled={!amount || loading}
            >
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

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={16} color="#0B2D72" />
              <Text style={styles.infoText}>
                Payments secured by Razorpay. Amount will be credited instantly.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubText}>
                  Add money to get started
                </Text>
              </View>
            ) : (
              transactions.map((tx) => {
                const { icon, color } = getTransactionIcon(tx.type);
                const isCredit = ["topup", "refund", "release"].includes(tx.type);
                return (
                  <View key={tx.id} style={styles.txItem}>
                    <View style={[styles.txIcon, { backgroundColor: color + "20" }]}>
                      <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txLabel}>
                        {getTransactionLabel(tx.type)}
                      </Text>
                      <Text style={styles.txDate}>
                        {formatDate(tx.created_at)}
                      </Text>
                      {tx.ref_id && (
                        <Text style={styles.txRef} numberOfLines={1}>
                          Ref: {tx.ref_id}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: isCredit ? "#10b981" : "#ef4444" },
                      ]}
                    >
                      {isCredit ? "+" : "-"}₹{parseFloat(tx.amount).toFixed(2)}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.85,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B2D72",
  },
  headerSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    backgroundColor: "#0B2D72",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#0B2D72",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  balanceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#f0f4ff",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#0B2D72",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B2D72",
  },
  tabTextActive: {
    color: "#fff",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#0B2D72",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  quickBtnActive: {
    backgroundColor: "#0B2D72",
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B2D72",
  },
  quickBtnTextActive: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e0e7ff",
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  rupeeSign: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2D72",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  addBtn: {
    backgroundColor: "#0B2D72",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#0B2D72",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addBtnDisabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  txDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  txRef: {
    fontSize: 10,
    color: "#bbb",
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
});