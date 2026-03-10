import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axiosInstance from "../../services/api";

const { height } = Dimensions.get("window");

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("topup");

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();

    loadUserAndBalance();
  }, []);

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
      console.log(e);
    }
  };

  const fetchBalance = async (uid) => {
    try {
      setLoadingBalance(true);

      const res = await axiosInstance.get(`/wallet/balance/${uid}`);

      setBalance(res?.data?.balance || 0);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchHistory = async (uid) => {
    try {
      const res = await axiosInstance.get(`/wallet/history/${uid}`);

      setTransactions(res?.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddMoney = async () => {
    const amt = parseInt(amount);

    if (!amt || amt < 1) {
      Alert.alert("Invalid Amount", "Please enter valid amount");
      return;
    }

    try {
      setLoading(true);

      const orderRes = await axiosInstance.post("/payment/create-order", {
        amount: amt,
      });

      const order = orderRes?.data?.order;

      if (!order?.id) {
        throw new Error("Order creation failed");
      }

      Alert.alert("Payment", `Order created for ₹${amt}`, [
        {
          text: "Simulate Success",
          onPress: () => simulatePaymentSuccess(order.id, amt),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } catch (e) {
      Alert.alert("Error", "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async (orderId, amt) => {
    try {
      setLoading(true);

      await axiosInstance.post("/wallet/topup", {
        userId: userId,
        amount: amt,
      });

      await fetchBalance(userId);
      await fetchHistory(userId);

      setAmount("");
      setActiveTab("history");

      Alert.alert("Success", `₹${amt} added to wallet`);
    } catch (e) {
      Alert.alert("Error", "Topup failed");
    } finally {
      setLoading(false);
    }
  };

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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <Text style={styles.headerSub}>Career Talk Balance</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="wallet-outline" size={28} color="#fff" />

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.balanceLabel}>Available Balance</Text>

              {loadingBalance ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.balanceAmount}>
                  ₹{parseFloat(balance).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "topup" && styles.tabActive]}
            onPress={() => setActiveTab("topup")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "topup" && styles.tabTextActive,
              ]}
            >
              Add Money
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.tabActive]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.tabTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "topup" ? (
          <ScrollView>
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((qa) => (
                <TouchableOpacity
                  key={qa}
                  style={styles.quickBtn}
                  onPress={() => setAmount(String(qa))}
                >
                  <Text style={styles.quickBtnText}>₹{qa}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.rupeeSign}>₹</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handleAddMoney}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addBtnText}>Add ₹{amount || "0"}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView>
            {transactions.map((tx) => {
              const { icon, color } = getTransactionIcon(tx.type);

              return (
                <View key={tx.id} style={styles.txItem}>
                  <Ionicons name={icon} size={22} color={color} />

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.txLabel}>{tx.type}</Text>

                    <Text style={styles.txDate}>
                      {formatDate(tx.created_at)}
                    </Text>
                  </View>

                  <Text style={styles.txAmount}>₹{tx.amount}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B2D72",
  },

  headerSub: {
    fontSize: 12,
    color: "#777",
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  balanceCard: {
    backgroundColor: "#0B2D72",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },

  balanceAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
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
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },

  tabActive: {
    backgroundColor: "#0B2D72",
  },

  tabText: {
    fontWeight: "600",
    color: "#0B2D72",
  },

  tabTextActive: {
    color: "#fff",
  },

  quickAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  quickBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#0B2D72",
    borderRadius: 10,
  },

  quickBtnText: {
    fontWeight: "700",
    color: "#0B2D72",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  rupeeSign: {
    fontSize: 18,
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 18,
  },

  addBtn: {
    backgroundColor: "#0B2D72",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  txLabel: {
    fontWeight: "700",
  },

  txDate: {
    fontSize: 11,
    color: "#999",
  },

  txAmount: {
    fontWeight: "800",
  },
});
