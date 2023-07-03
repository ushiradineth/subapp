import { Stack } from "expo-router";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Subscriptions", headerShown: false }} />
      <Stack.Screen name="[subscriptionId]" options={{ headerTitle: "Subscription", headerTitleAlign: "center" }} />
    </Stack>
  );
};

export default StackLayout;
