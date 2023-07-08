import React from "react";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import ButtonWide from "~/components/Atoms/ButtonWide";

export default function Lists() {
  const router = useRouter();

  return (
    <ScrollView backgroundColor={"$background"}>
      <YStack className="p-4" space>
        <ButtonWide text="Current Subscriptions" justifyText="center" onPress={() => router.push("/lists/subscriptions")} />
        <ButtonWide text="Wishlist" justifyText="center" onPress={() => router.push("/lists/wishlist")} />
        <ButtonWide text="Subscription History" justifyText="center" onPress={() => router.push("/lists/history")} />
        <ButtonWide text="Add custom subscriptions" justifyText="center" onPress={() => router.push("/lists/custom")} />
      </YStack>
    </ScrollView>
  );
}
