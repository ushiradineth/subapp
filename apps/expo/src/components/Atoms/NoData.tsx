import React from "react";
import { Text, View } from "react-native";
import { YStack } from "tamagui";

const NoData = ({ children, background }: { children: React.ReactNode, background?: boolean }) => {
  if (background) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" space={4}>
        <View className="flex h-full items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">{children}</Text>
        </View>
      </YStack>
    );
  }

  return (
    <View className="flex h-full items-center justify-center">
      <Text className="text-lg font-semibold text-gray-500">{children}</Text>
    </View>
  );
};

export default NoData;
