import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const transactions = [
  {
    id: "1",
    title: "Grocery",
    subtitle: "Eataly downtown",
    amount: "-₹50.68",
    date: "Aug 26",
  },
  {
    id: "2",
    title: "Transport",
    subtitle: "Uber Pool",
    amount: "-₹6.00",
    date: "Aug 26",
  },
  {
    id: "3",
    title: "Payment",
    subtitle: "Payment from Andre",
    amount: "+₹650.00",
    date: "Aug 25",
  },
];

export default function Wallet() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.balance}>₹2,589.50</Text>
        <Text style={styles.balanceLabel}>Available Balance</Text>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <ActionButton icon="send" label="Send" />
          <ActionButton icon="download" label="Request" />
          <ActionButton icon="cash" label="Loan" />
          <ActionButton icon="wallet" label="Topup" />
        </View>
      </View>

      {/* TRANSACTION SECTION */}
      <View style={styles.transactionContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>Recent Transactions</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <Ionicons name="card" size={24} color="#0B2D72" />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.amount,
                    { color: item.amount.includes("+") ? "green" : "red" },
                  ]}
                >
                  {item.amount}
                </Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

function ActionButton({ icon, label }) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Ionicons name={icon} size={22} color="#0B2D72" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    backgroundColor: "#0B2D72",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  balance: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  balanceLabel: {
    color: "#d0d7ff",
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  actionBtn: {
    backgroundColor: "#fff",
    width: 65,
    height: 65,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    fontSize: 11,
    marginTop: 4,
  },

  transactionContainer: {
    padding: 20,
  },

  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  transactionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  seeAll: {
    color: "#0B2D72",
    fontWeight: "600",
  },

  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  title: {
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 12,
    color: "#777",
  },

  amount: {
    fontWeight: "bold",
  },

  date: {
    fontSize: 11,
    color: "#888",
  },
});
