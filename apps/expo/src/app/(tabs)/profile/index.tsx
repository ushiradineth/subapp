import React from "react";
import { useRouter } from "expo-router";
import { H2, YStack } from "tamagui";

export default function Profile() {
  const router = useRouter();

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <H2 className="text-center text-2xl font-bold">Profile</H2>
    </YStack>
  );
}
