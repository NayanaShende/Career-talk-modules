import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFD600",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },
      }}
    >
      {/* DASHBOARD */}
      <Tabs.Screen
        name="dashboard/dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* SEARCH */}
      <Tabs.Screen
        name="expert/search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* HIDE THESE FROM TAB BAR */}
      <Tabs.Screen name="expert/recommended" options={{ href: null }} />
      <Tabs.Screen name="expert/online" options={{ href: null }} />
      <Tabs.Screen name="expert/[id]" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}