import React from "react";
import { Text } from "react-native";
import { Button } from "tamagui";

interface Props {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
}

const ButtonWide = ({ icon, text, onPress }: Props) => {
  return (
    <Button onPress={onPress} className="bg-background flex h-16 w-full items-center justify-start rounded-3xl">
      {icon}
      <Text className="text-[16px] font-semibold">{text}</Text>
    </Button>
  );
};

export default ButtonWide;
