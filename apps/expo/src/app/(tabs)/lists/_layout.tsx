import { Stack, usePathname } from "expo-router";

import BackButton from "~/components/Atoms/BackButton";

const StackLayout = () => {
  const pathname = usePathname();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Lists" }} />
      <Stack.Screen name="wishlist" options={{ headerTitle: "Wishlist", headerTitleAlign: "center" }} />
      <Stack.Screen name="history" options={{ headerTitle: "Subscription History", headerTitleAlign: "center" }} />
      <Stack.Screen
        name="custom"
        options={{
          headerTitle: "Create custom subscription",
          headerTitleAlign: "center",
          presentation: "modal",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="subscriptions"
        options={{
          headerTitle: "Subscriptions",
          headerTitleAlign: "center",
          headerShown: pathname === "/lists/subscriptions"
        }}
      />
    </Stack>
  );
};

export default StackLayout;
