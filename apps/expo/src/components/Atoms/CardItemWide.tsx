import React, { type ReactNode } from "react";
import { Image, Text, XStack, YStack } from "tamagui";

interface Props {
  image: string;
  onPress: () => void;
  title: ReactNode;
  text1?: ReactNode;
  text2?: ReactNode;
  text3?: ReactNode;
}

const CardItemWide = ({ title, text1, text2, text3, image, onPress }: Props) => {
  return (
    <XStack onPress={onPress} className="bg-background flex w-full items-center justify-start rounded-2xl p-2">
      <Image className="bg-foreground rounded-2xl" source={{ uri: image, height: 144, width: 144 }} alt={title?.toString()} />
      <YStack className="flex justify-center rounded-b-2xl p-2">
        <Text className="text-xs font-semibold">{title}</Text>
        {text1 && <Text className="text-xs">{text1}</Text>}
        {text2 && <Text className="text-xs">{text2}</Text>}
        {text3 && <Text className="text-xs">{text3}</Text>}
      </YStack>
    </XStack>
  );
};

export default CardItemWide;
