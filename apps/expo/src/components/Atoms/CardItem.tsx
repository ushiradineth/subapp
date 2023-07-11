import React, { type ReactNode } from "react";
import { Image, Text, YStack } from "tamagui";

interface Props {
  image: string;
  onPress: () => void;
  title: ReactNode;
  text1?: ReactNode;
}

const CardItem = ({ image, title, text1, onPress }: Props) => {
  return (
    <YStack onPress={onPress} className="w-36">
      <Image className="bg-foreground rounded-t-2xl" source={{ uri: image, height: 144, width: 144 }} alt={title?.toString()} />
      <YStack className="bg-background flex h-12 w-full justify-center rounded-b-2xl pl-2">
        <Text className="text-xs font-semibold">{title}</Text>
        {text1 && <Text className="text-xs">{text1}</Text>}
      </YStack>
    </YStack>
  );
};

export default CardItem;
