import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";

export default function EditScreen() {
  const userEmail = "xyz@gmail.com"; // get from login session

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    domain: "",
    qualification: "",
    experience: "",
    birthdate: "",
    profile_image: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://192.168.1.22:3000/api/profile/${userEmail}`,
      );
      setForm(res.data);
    } catch (err) {
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleChange("profile_image", result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      await axios.put("http://192.168.1.22:3000/api/profile/update", form);

      Alert.alert("Success", "Profile Updated Successfully");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE */}
        <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
          <Image
            source={{
              uri: form.profile_image || "https://i.pravatar.cc/150",
            }}
            style={styles.avatar}
          />
          <Text style={styles.changePhoto}>Change Photo</Text>
        </TouchableOpacity>

        {/* INPUT FIELDS */}
        <Input
          label="Full Name"
          value={form.full_name}
          onChangeText={(v) => handleChange("full_name", v)}
        />
        <Input label="Email" value={form.email} editable={false} />
        <Input
          label="Mobile"
          value={form.mobile}
          onChangeText={(v) => handleChange("mobile", v)}
        />
        <Input
          label="Domain"
          value={form.domain}
          onChangeText={(v) => handleChange("domain", v)}
        />
        <Input
          label="Qualification"
          value={form.qualification}
          onChangeText={(v) => handleChange("qualification", v)}
        />
        <Input
          label="Experience"
          value={form.experience}
          onChangeText={(v) => handleChange("experience", v)}
        />
        <Input
          label="Birth Date (YYYY-MM-DD)"
          value={form.birthdate}
          onChangeText={(v) => handleChange("birthdate", v)}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProfile}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const Input = ({ label, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },

  imageWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
  },

  changePhoto: {
    color: "#6C63FF",
    marginTop: 8,
    fontWeight: "600",
  },

  inputContainer: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,
    color: "#6B7280",
    fontSize: 13,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  saveButton: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
