import React from "react";
import { useRouter } from "expo-router";
import { useSignUp,  } from "@clerk/clerk-expo";
import { Button, H2, H6, Input, Text, XStack, YStack } from "tamagui";

export default function Register() {
  const router = useRouter();
  const { signUp, setSession, isLoaded } = useSignUp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signup = await signUp.create({
        emailAddress: email,
        password,
      });

      await setSession(signup.createdSessionId);
    } catch (err) {
      // @ts-ignore
      console.log("Error:> " + (err.errors ? err.errors[0].message : err));
    }
  };

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <H2 className="text-center text-2xl font-bold">Register</H2>

      <YStack className="w-full">
        <H6 className="font-bold">Email</H6>
        <Input className="w-full" value={email} autoCapitalize="none" placeholder="Enter your email" onChangeText={(email) => setEmail(email)} />
      </YStack>

      <YStack className="w-full">
        <H6 className="font-bold">Password</H6>
        <Input className="w-full" value={password} placeholder="Enter your Password" secureTextEntry={true} onChangeText={(password) => setPassword(password)} />
      </YStack>

      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={onSignUpPress} className={"w-full"}>
        Register
      </Button>

      <YStack className="flex items-center justify-center" space={8}>
        <XStack>
          <Text>Already have an account? </Text>
          <Text className="font-bold" onPress={() => router.push("auth/login")}>
            Login Here
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
