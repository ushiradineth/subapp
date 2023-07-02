import { Stack } from "expo-router";

import BackButton from "~/components/Atoms/BackButton";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Tiers",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[tierId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
