import { Stack, usePathname } from "expo-router";

export default function Layout() {
  const pathname = usePathname();

  return (
    <Stack>
      <Stack.Screen
        name="index"
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
          headerShown: pathname.startsWith("/product") && pathname.endsWith("/review"),
        }}
      />
    </Stack>
  );
}
