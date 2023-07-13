import { Asset } from "expo-asset";
import { Stack, useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { Image, Text } from "tamagui";

const StackLayout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Image
              resizeMode="contain"
              source={{ uri: Asset.fromModule(require("../../../../assets/logo.png")).uri, height: 50, width: 50 }}
              alt="Icon"
            />
          ),
          // headerLeft: () => (
          //   <Text className="mt-2" onPress={() => router.push("/home/notifications")}>
          //     <Bell color="black" />
          //   </Text>
          // ),
          headerRight: () => (
            <Text className="mt-2" onPress={() => router.push("/home/search")}>
              <Search color="black" />
            </Text>
          ),
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
