import { Stack } from "expo-router";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Bills" }} />
    </Stack>
  );
};

export default StackLayout;
