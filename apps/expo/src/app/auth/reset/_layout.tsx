import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Reset your Password",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          title: "Verify your identity",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
