import React from "react";
import { View } from "react-native";
import { Text, XStack } from "tamagui";

export default function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <XStack className="flex h-16 items-center justify-between">
      <View className="bg-background border-accent flex h-full w-full items-center justify-center rounded-3xl border">
        <Text>{children}</Text>
      </View>
    </XStack>
  );
}
