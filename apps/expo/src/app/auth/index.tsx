import React from "react";
import { Link, useRouter } from "expo-router";
import { Button, H2, H6, YStack } from "tamagui";

const index = () => {
  const router = useRouter();

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <H2 className="text-center text-2xl font-bold">Welcome to SubM</H2>

      <YStack className="w-full" space>
        <Link href="/auth/login" asChild>
          <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} className={"w-full"}>
            Login
          </Button>
        </Link>

        <Link href="/auth/register" asChild>
          <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} className={"w-full"}>
            Register
          </Button>
        </Link>

        <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={() => router.push("/auth/no-route-yet")} className={"w-full"}>
          Learn more about SubM
        </Button>
      </YStack>
      <H6 className="text-center font-bold">This is a placeholder index screen</H6>
    </YStack>
  );
};

export default index;
