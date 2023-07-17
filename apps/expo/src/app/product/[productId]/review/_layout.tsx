import { useMemo } from "react";
import { Stack } from "expo-router";

import BackButton from "~/components/Atoms/BackButton";

export default function Layout() {
  const memoizedValues = useMemo(() => {
    return {
      backbutton: <BackButton />,
    };
  }, []);

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
          headerLeft: () => memoizedValues.backbutton,
          presentation: "modal",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
