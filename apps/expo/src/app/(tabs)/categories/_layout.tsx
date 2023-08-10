import { useMemo } from "react";
import { Stack } from "expo-router";

import BackButton from "~/components/Atoms/BackButton";

const StackLayout = () => {
  const memoizedValues = useMemo(() => {
    return {
      backbutton: <BackButton />,
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Categories", headerTitleAlign: "center" }} />
      <Stack.Screen
        name="[categoryId]"
        options={{
          title: "Category",
          headerLeft: () => memoizedValues.backbutton,
          presentation: "modal",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
};

export default StackLayout;
