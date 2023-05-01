import React from "react";
import { Spinner, YStack } from "tamagui";

export const SpinnerComponent = () => {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" space={4}>
      <Spinner size="large" color="$accent" />
    </YStack>
  );
};
