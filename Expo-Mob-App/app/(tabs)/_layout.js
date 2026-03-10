import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native"; // ✅ NEW
import { useNotification } from "../../context/NotificationContext";// ✅ NEW

export default function TabLayout() {
  const { totalUnread } = useNotification(); // ✅ NEW

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0B2D72",
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
          href: "/(tabs)/dashboard/dashboard",
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
          href: "/(tabs)/expert/search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* CHAT ✅ NEW: badge on chat icon */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          href: "/(tabs)/chat",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size }}>
              <Ionicons name="chatbubble" size={size} color={color} />
              {totalUnread > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    backgroundColor: "#e53935",
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 3,
                    borderWidth: 1.5,
                    borderColor: "#fff",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: "/(tabs)/profile",
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