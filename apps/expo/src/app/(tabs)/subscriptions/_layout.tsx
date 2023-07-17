import { Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";

const StackLayout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Subscriptions",
          headerTitleAlign: "center",
          headerRight: () => (
            <Pressable android_ripple={{ color: "gray", borderless: true, radius: 20 }} onPress={() => router.push("subscriptions/custom")}>
              <Plus color="black" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="[subscriptionId]" options={{ headerTitle: "Subscription", headerTitleAlign: "center", presentation: "modal" }} />
      <Stack.Screen name="wishlist" options={{ headerTitle: "Wishlist", headerTitleAlign: "center", presentation: "modal" }} />
      <Stack.Screen name="history" options={{ headerTitle: "Subscription History", headerTitleAlign: "center", presentation: "modal" }} />
      <Stack.Screen name="custom" options={{ headerTitle: "Custom Subscription", headerTitleAlign: "center", presentation: "modal" }} />
    </Stack>
  );
};

export default StackLayout;
