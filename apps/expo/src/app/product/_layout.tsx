import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="[productId]"
        options={{
          title: "Product",
        }}
      />
      <Stack.Screen
        name="tier"
        options={{
          title: "Tiers",
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: "Reviews",
        }}
      />
    </Stack>
  );
}
