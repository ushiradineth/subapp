import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Tier",
          headerTitleAlign: "center"
        }}
      />
      <Stack.Screen
        name="subscribe"
        options={{
          title: "Subscribe",
          presentation: "modal",
          headerTitleAlign: "center"
        }}
      />
    </Stack>
  );
}
