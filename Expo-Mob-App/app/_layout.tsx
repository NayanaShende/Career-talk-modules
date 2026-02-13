import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      {/* Status bar style */}
      <StatusBar style="dark" />

      {/* Stack controls navigation */}
      <Stack
        screenOptions={{
          headerShown: false, // hides top header (recommended)
          contentStyle: {
            backgroundColor: "#ffffff",
          },
        }}
      />
    </>
  );
}
