import { Stack } from "expo-router";

import BackButton from "~/components/Atoms/BackButton";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Categories", headerTitleAlign: "center" }} />
      <Stack.Screen
        name="[categoryId]"
        options={{
          title: "Category",
          headerLeft: () => <BackButton />,
          presentation: "modal",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
};

export default StackLayout;
