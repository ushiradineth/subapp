import { Stack } from "expo-router";

import BackButton from "~/components/BackButton";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Reviews",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[reviewId]"
        options={{
          title: "Review",
          headerLeft: () => <BackButton />,
          presentation: "modal",
          headerTitleAlign: "center"
        }}
      />
    </Stack>
  );
}
