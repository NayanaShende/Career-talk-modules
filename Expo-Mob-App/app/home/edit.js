import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";

export default function EditProfile() {
  const [name, setName] = useState("Shivam Kumar");
  const [email, setEmail] = useState("shivam@email.com");
  const [phone, setPhone] = useState("123-456-7890");
  const [address, setAddress] = useState("45 New Avenue, New York");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Input label="Full Name" value={name} onChangeText={setName} />
          <Input label="Email" value={email} onChangeText={setEmail} />
          <Input label="Phone Number" value={phone} onChangeText={setPhone} />
          <Input label="Address" value={address} onChangeText={setAddress} />

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>SUBMIT</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  form: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },

  label: {
    marginBottom: 6,
    color: "#6B7280",
    fontWeight: "500",
  },

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

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
