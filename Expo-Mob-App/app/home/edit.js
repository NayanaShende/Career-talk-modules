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
  StyleSheet,
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

    // Jobseeker fields
    skills: "",
    preferred_job_role: "",
    current_status: "",

    // Expert fields
    expertise: "",
    years_of_experience: "",
    linkedin: "",

    image_file: null,
    image_url: "",
  });

  // FETCH PROFILE
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

        skills: user.skills || "",
        preferred_job_role: user.preferred_job_role || "",
        current_status: user.current_status || "",

        expertise: user.expertise || "",
        years_of_experience: user.years_of_experience || "",
        linkedin: user.linkedin || "",

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

  // PICK IMAGE
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required to access gallery");
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
        image_url: result.assets[0].uri,
      });
    }
  };

  // SAVE PROFILE
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

      // Jobseeker
      formData.append("skills", form.skills);
      formData.append("preferred_job_role", form.preferred_job_role);
      formData.append("current_status", form.current_status);

      // Expert
      formData.append("expertise", form.expertise);
      formData.append("years_of_experience", form.years_of_experience);
      formData.append("linkedin", form.linkedin);

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

      Alert.alert("Success", "Profile Updated Successfully");
      router.back();
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* PROFILE IMAGE */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <Image
          source={{
            uri: form.image_url || "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      {/* BASIC DETAILS */}
      <Text style={styles.sectionTitle}>Basic Information</Text>

      <Input label="Full Name" value={form.full_name} onChange="full_name" />
      <Input label="Email" value={form.email} onChange="email" />
      <Input label="Mobile" value={form.mobile} onChange="mobile" />
      <Input label="Domain" value={form.domain} onChange="domain" />
      <Input
        label="Qualification"
        value={form.qualification}
        onChange="qualification"
      />
      <Input label="Experience" value={form.experience} onChange="experience" />
      <Input label="Date of Birth" value={form.dob} onChange="dob" />

      {/* JOBSEEKER */}
      <Text style={styles.sectionTitle}>Jobseeker Details</Text>

      <Input label="Skills" value={form.skills} onChange="skills" />
      <Input
        label="Preferred Job Role"
        value={form.preferred_job_role}
        onChange="preferred_job_role"
      />
      <Input
        label="Current Status (Student / Fresher)"
        value={form.current_status}
        onChange="current_status"
      />

      {/* EXPERT */}
      <Text style={styles.sectionTitle}>Expert Details</Text>

      <Input label="Expertise" value={form.expertise} onChange="expertise" />
      <Input
        label="Years of Experience"
        value={form.years_of_experience}
        onChange="years_of_experience"
      />
      <Input
        label="LinkedIn Profile"
        value={form.linkedin}
        onChange="linkedin"
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  function Input({ label, value, onChange }) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={(text) => setForm({ ...form, [onChange]: text })}
          style={styles.input}
        />
      </View>
    );
  }
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  changePhoto: {
    color: "#007bff",
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    marginBottom: 5,
    fontWeight: "500",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },

  saveBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
