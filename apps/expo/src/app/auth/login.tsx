import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { Button, H2, H6, Input, Text, XStack, YStack } from "tamagui";

export default function Login() {
  const router = useRouter();
  const { signIn, setSession, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    error !== "" && setError("");
  }, [email, password]);

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signin = await signIn.create({
        identifier: email,
        password,
      });

      await setSession(signin.createdSessionId);
    } catch (err) {
      // @ts-ignore
      setError(`Error: ${err.errors ? err.errors[0].message : err}`);
    }
  };

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <H2 className="text-center text-2xl font-bold">Login</H2>

      <YStack className="w-full">
        <H6 className="font-bold">Email</H6>
        <Input className="w-full" value={email} autoCapitalize="none" placeholder="Enter your email" onChangeText={(email) => setEmail(email)} />
      </YStack>

      <YStack className="w-full">
        <H6 className="font-bold">Password</H6>
        <Input className="w-full" value={password} placeholder="Enter your Password" secureTextEntry={true} onChangeText={(password) => setPassword(password)} />
      </YStack>

      {error && <Text color={"red"}>{error}</Text>}

      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={onSignInPress} className={"w-full"}>
        Log in
      </Button>

      <YStack className="flex items-center justify-center" space={8}>
        <XStack>
          <Text>Don&apos;t have an account? </Text>
          <Text className="font-bold" onPress={() => router.push("auth/register")}>
            Register here
          </Text>
        </XStack>
        <Text className="font-bold" onPress={() => router.push("auth/password-reset")}>
          Reset password
        </Text>
      </YStack>
    </YStack>
  );
}
