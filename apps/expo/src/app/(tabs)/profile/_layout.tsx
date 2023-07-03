import { Stack } from "expo-router";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Profile" }} />
      <Stack.Screen name="edit" options={{ headerTitle: "Edit Profile", presentation: "modal" }} />
    </Stack>
  );
};

export default StackLayout;
