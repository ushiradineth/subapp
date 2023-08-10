import { useMemo } from "react";
import { Pressable } from "react-native";
import { Asset } from "expo-asset";
import { Stack, useRouter } from "expo-router";
import { Bell, Search } from "lucide-react-native";
import { Image } from "tamagui";

const StackLayout = () => {
  const router = useRouter();

  const memoizedValues = useMemo(() => {
    return {
      icon: (
        <Image
          resizeMode="contain"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-var-requires
          source={{ uri: Asset.fromModule(require("../../../../assets/logo.png")).uri, height: 50, width: 50 }}
          alt="Icon"
        />
      ),
      search: (
        <Pressable android_ripple={{ color: "gray", borderless: true, radius: 20 }} onPress={() => router.push("/home/search")}>
          <Search color="black" />
        </Pressable>
      ),
      notifications: (
        <Pressable android_ripple={{ color: "gray", borderless: true, radius: 20 }} onPress={() => router.push("/home/notifications")}>
          <Bell color="black" />
        </Pressable>
      ),
    };
  }, [router]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => memoizedValues.icon,
          // headerLeft: () => memoizedValues.notifications,
          headerRight: () => memoizedValues.search,
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          headerTitle: "Search",
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default StackLayout;
