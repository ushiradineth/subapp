import { useMemo } from "react";
import { Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";

const StackLayout = () => {
  const router = useRouter();

  const memoizedValues = useMemo(() => {
    return {
      add: (
        <Pressable android_ripple={{ color: "gray", borderless: true, radius: 20 }} onPress={() => router.push("subscriptions/custom")}>
          <Plus color="black" />
        </Pressable>
      ),
    };
  }, [router]);
  
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Subscriptions",
          headerTitleAlign: "center",
          headerRight: () => memoizedValues.add,
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
