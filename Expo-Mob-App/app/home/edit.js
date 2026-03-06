import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const BASE_URL = "http://192.168.1.3:3000";

const EditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    domain: "",
    qualification: "",
    experience: "",
    dob: "",
    image_file: null, // local uri
    image_url: "", // server url
  });

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data.user;

      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        domain: user.domain || "",
        qualification: user.qualification || "",
        experience: user.experience || "",
        dob: user.dob || "",
        image_file: null,
        image_url: user.image ? `${BASE_URL}/uploads/${user.image}` : "",
      });
    } catch (err) {
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setForm({
        ...form,
        image_file: result.assets[0].uri,
        image_url: result.assets[0].uri, // display immediately
      });
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("email", form.email);
      formData.append("mobile", form.mobile);
      formData.append("domain", form.domain);
      formData.append("qualification", form.qualification);
      formData.append("experience", form.experience);
      formData.append("dob", form.dob);

      if (form.image_file) {
        formData.append("image", {
          uri: form.image_file,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }

      await axios.post(`${BASE_URL}/api/users/save-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Profile Updated");
      router.back();
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity onPress={pickImage} style={{ alignSelf: "center" }}>
        <Image
          source={{
            uri: form.image_url || "https://via.placeholder.com/150",
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 20,
          }}
        />
        <Text style={{ textAlign: "center", color: "blue" }}>Change Photo</Text>
      </TouchableOpacity>

      {[
        ["Full Name", "full_name"],
        ["Email", "email"],
        ["Mobile", "mobile"],
        ["Domain", "domain"],
        ["Qualification", "qualification"],
        ["Experience", "experience"],
        ["Date of Birth", "dob"],
      ].map(([label, key]) => (
        <View key={key} style={{ marginBottom: 15 }}>
          <Text style={{ marginBottom: 5 }}>{label}</Text>
          <TextInput
            value={form[key]}
            onChangeText={(text) => setForm({ ...form, [key]: text })}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 8,
            }}
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={saveProfile}
        style={{
          backgroundColor: "#007bff",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 10,
        }}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Save Changes
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfile;
