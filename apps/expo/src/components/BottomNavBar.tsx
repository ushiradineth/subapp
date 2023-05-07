import React from "react";
import { usePathname, useRouter } from "expo-router";
import { Coins, Home, List, MessagesSquare, User } from "lucide-react-native";
import { Text, YStack } from "tamagui";

import { BNB_ROUTES } from "~/utils/routes";

export const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <YStack className="absolute bottom-0 left-0 z-10 flex h-12 w-screen flex-row items-center justify-around border-t border-gray-400">
      <Text onPress={() => router.push(BNB_ROUTES.HOME)}>{pathname.startsWith(BNB_ROUTES.HOME) ? <Home color="black" strokeWidth={3} /> : <Home color="black"/>}</Text>
      <Text onPress={() => router.push(BNB_ROUTES.LISTS)}>{pathname.startsWith(BNB_ROUTES.LISTS) ? <List color="black" strokeWidth={3} /> : <List color="black"/>}</Text>
      <Text onPress={() => router.push(BNB_ROUTES.BILLS)}>{pathname.startsWith(BNB_ROUTES.BILLS) ? <Coins color="black" strokeWidth={3} /> : <Coins color="black"/>}</Text>
      <Text onPress={() => router.push(BNB_ROUTES.DISCOVER)}>{pathname.startsWith(BNB_ROUTES.DISCOVER) ? <MessagesSquare color="black" strokeWidth={3}/> : <MessagesSquare color="black" />}</Text>
      <Text onPress={() => router.push(BNB_ROUTES.PROFILE)}>{pathname.startsWith(BNB_ROUTES.PROFILE) ? <User color="black" strokeWidth={3}/> : <User color="black" />}</Text>
    </YStack>
  );
};
