import React from "react";
import { Spinner as Loader, YStack } from "tamagui";

interface Props {
  background?: boolean;
  color?: string;
}

export const Spinner = ({ background, color = "$accent" }: Props) => {
  if (background) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" space={4}>
        <Loader testID="spinner-background" color={color} />
      </YStack>
    );
  }

  return <Loader testID="spinner" color={color} />;
};
