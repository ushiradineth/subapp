import { Stack, usePathname } from "expo-router";
import { useMemo } from "react";

import BackButton from "~/components/Atoms/BackButton";

export default function Layout() {
  const pathname = usePathname();

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
          title: "Product",
          headerTitleAlign: "center",
          headerLeft: () => memoizedValues.backbutton,
        }}
      />
      <Stack.Screen
        name="tier"
        options={{
          title: "Tiers",
          headerShown: pathname.startsWith("/product") && !pathname.includes("/tier/"),
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: "Reviews",
          headerShown: pathname.startsWith("/product") && pathname.endsWith("/review"),
        }}
      />
      <Stack.Screen
        name="review-product"
        options={{
          title: "Add review",
          presentation: "modal",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
