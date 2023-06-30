import { Stack } from "expo-router";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Lists" }} />
      <Stack.Screen name="wishlist" options={{ headerTitle: "Wishlist", headerTitleAlign: "center" }} />
      <Stack.Screen name="history" options={{ headerTitle: "Subscription History", headerTitleAlign: "center" }} />
      <Stack.Screen name="custom" options={{ headerTitle: "Create custom subscription", headerTitleAlign: "center", presentation: "modal" }} />
      <Stack.Screen name="subscriptions" options={{ headerTitle: "Subscriptions", headerTitleAlign: "center" }} />
    </Stack>
  );
};

export default StackLayout;
