import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login to SubM",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register to SubM",
        }}
      />
      <Stack.Screen
        name="reset"
        options={{
          title: "Reset your Password",
        }}
      />
    </Stack>
  );
}
