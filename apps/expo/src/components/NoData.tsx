import React from "react";
import { Text, View } from "react-native";

const NoData = ({ children }: { children: React.ReactNode }) => {
  return (
    <View className="flex items-center h-full justify-center">
      <Text className="text-lg font-semibold text-gray-500">{children}</Text>
    </View>
  );
};

export default NoData;
