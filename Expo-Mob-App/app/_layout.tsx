import { Stack } from "expo-router";

export default function ExpertLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Experts",
        }}
      />

      <Stack.Screen
        name="recommended"
        options={{
          title: "Top Recommended Experts",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Expert Profile",
        }}
      />
    </Stack>
  );
}
