import { Stack, usePathname } from "expo-router";

export default function Layout() {
  const pathname = usePathname();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Tier",
        }}
      />
      <Stack.Screen
        name="subscribe"
        options={{
          title: "Subscribe",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
