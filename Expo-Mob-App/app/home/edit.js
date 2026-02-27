import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await AsyncStorage.getItem("profile");
    if (data) setProfile(JSON.parse(data));
  };

  const saveProfile = async () => {
    await AsyncStorage.setItem("profile", JSON.stringify(profile));
    Alert.alert("Saved!", "Profile updated successfully");
router.back();  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
          />

          <Input
            label="Email"
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
          />

          <Input
            label="Phone"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
          />

          <Input
            label="Address"
            value={profile.address}
            onChangeText={(text) => setProfile({ ...profile, address: text })}
          />

          <Pressable style={styles.button} onPress={saveProfile}>
            <Text style={styles.buttonText}>SAVE</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Input({ label, value, onChangeText }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  form: { backgroundColor: "#fff", margin: 16, padding: 20, borderRadius: 16 },
  label: { marginBottom: 6, color: "#6B7280" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  button: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
