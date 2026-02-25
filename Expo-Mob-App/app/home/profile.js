import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    const data = await AsyncStorage.getItem("profile");

    if (data) {
      setProfile(JSON.parse(data));
    } else {
      const defaultProfile = {
        name: "NAME",
        email: "xyz@gmail.com",
        phone: "123-456-7890",
        address: "",
      };
      setProfile(defaultProfile);
      await AsyncStorage.setItem("profile", JSON.stringify(defaultProfile));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PROFILE</Text>
          </View>

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <Text style={styles.phone}>{profile.phone}</Text>
        </View>

        <View style={styles.menuContainer}>
          <MenuItem
            icon="person-outline"
            text="Edit profile information"
          onPress={() => router.push("/home/edit")}
          />

          <MenuItem
            icon="notifications-outline"
            text="Notifications"
            right="ON"
          />
          <MenuItem icon="language-outline" text="Language" right="English" />
          <MenuItem icon="lock-closed-outline" text="Security" />
          <MenuItem icon="moon-outline" text="Theme" right="Light mode" />

          <View style={styles.divider} />

          <MenuItem icon="help-circle-outline" text="Help & Support" />
          <MenuItem icon="mail-outline" text="Contact us" />
          <MenuItem icon="document-text-outline" text="Privacy policy" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, text, right, onPress }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color="#4B5563" />
        <Text style={styles.menuText}>{text}</Text>
      </View>

      {right ? (
        <Text style={styles.rightText}>{right}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { alignItems: "center", marginTop: 20, marginBottom: 20 },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: { color: "#fff", fontWeight: "bold" },

  name: { fontSize: 22, fontWeight: "bold", marginTop: 12 },
  email: { color: "#6B7280", marginTop: 4 },
  phone: { color: "#6B7280", marginTop: 2 },

  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  left: { flexDirection: "row", alignItems: "center" },
  menuText: { marginLeft: 14, fontSize: 16 },
  rightText: { color: "#8B5CF6", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
});
