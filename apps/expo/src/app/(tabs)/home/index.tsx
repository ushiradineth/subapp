import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { Button, H1, YStack } from "tamagui";

import { api } from "~/utils/api";
import { AuthContext } from "~/app/_layout";

export default function Home() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <Button
        onPress={() => {
          auth.logout();
          router.replace("auth");
        }}
        backgroundColor={"$accent"}
        fontWeight={"600"}
        color={"white"}
        className={"w-full"}>
        Log out
      </Button>
      <H1>{auth.session?.name}</H1>
    </YStack>
  );
}
