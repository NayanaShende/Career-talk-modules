import { Stack } from "expo-router";
import { NotificationProvider } from "../context/NotificationContext";

export default function RootLayout() {
  return (
    // ✅ FIXED: wrap entire app with NotificationProvider
    // so notifications work across all screens
    <NotificationProvider>
      <Stack
        screenOptions={{
          headerShown: false, // ✅ removes header globally
        }}
      />
    </NotificationProvider>
  );
}