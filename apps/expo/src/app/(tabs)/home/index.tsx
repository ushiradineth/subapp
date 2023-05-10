import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Button, YStack } from "tamagui";

export default function Home() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={() => signOut().then(() => router.push("/"))} className={"w-full"}>
        Log out
      </Button>
    </YStack>
  );
}
