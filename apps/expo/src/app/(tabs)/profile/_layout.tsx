import { Stack } from "expo-router";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Profile", headerTitleAlign: "center" }} />
      <Stack.Screen name="edit" options={{ headerTitle: "Edit Profile", presentation: "modal" }} />
      <Stack.Screen name="wishlist" options={{ headerTitle: "Wishlist", headerTitleAlign: "center", presentation: "modal" }} />
      <Stack.Screen name="history" options={{ headerTitle: "Subscription History", headerTitleAlign: "center", presentation: "modal" }} />
    </Stack>
  );
};

export default StackLayout;
