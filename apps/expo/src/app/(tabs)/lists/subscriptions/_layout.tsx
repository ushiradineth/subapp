import { Stack } from "expo-router";

import BackButton from "~/components/Atoms/BackButton";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Subscriptions", headerShown: false }} />
      <Stack.Screen
        name="[subscriptionId]"
        options={{ headerTitle: "Subscription", headerTitleAlign: "center", presentation: "modal", headerLeft: () => <BackButton /> }}
      />
    </Stack>
  );
};

export default StackLayout;
