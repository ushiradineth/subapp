import { Stack, usePathname } from "expo-router";
import BackButton from "~/components/BackButton";

export default function Layout() {
  const pathname = usePathname();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Product",
          headerTitleAlign: "center",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="tier"
        options={{
          title: "Tiers",
          headerShown: pathname.startsWith("/product") && !pathname.includes("/tier/"),
          // headerTitleAlign: "center",
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
          title: "Add a review",
          headerLeft: () => <BackButton />,
          presentation: "modal"
        }}
      />
    </Stack>
  );
}
