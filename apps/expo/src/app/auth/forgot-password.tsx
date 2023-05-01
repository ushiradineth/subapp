import React from "react";
import { useRouter } from "expo-router";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { type EmailLinkFactor } from "@clerk/types";
import { Button, H2, H6, Input, Text, XStack, YStack } from "tamagui";

export default function Register() {
  const { signIn, setSession } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = React.useState("");

  const signInWithLink = async (email: string) => {
    // Prepare sign in with strategy and identifier
    await signIn!.create({
      strategy: "email_link",
      identifier: email,
      redirectUrl: "/profile/forgot-password",
    });

    // Make sure that email magic links are supported on this user.
    const firstFactor = signIn!.supportedFirstFactors.find((f) => f.strategy === "email_link") as EmailLinkFactor;
    // Find the correct emailAddressId for the user.
    const { emailAddressId } = firstFactor;

    // Begin the magic link flow
    const { startMagicLinkFlow } = signIn!.createMagicLinkFlow();

    // The redirectUrl should be a page where your user can change their password.
    const response = await startMagicLinkFlow({
      emailAddressId,
      redirectUrl: "/profile/forgot-password",
    });

    // Create a sesssion once the user is verified
    if (response.status === "complete" && setSession) {
      setSession(response.createdSessionId, () => router.push(`/`));
      return;
    }
  };

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      <H2 className="text-center text-2xl font-bold">Forgot Password</H2>

      <YStack className="w-full">
        <H6 className="font-bold">Email</H6>
        <Input className="w-full" value={email} autoCapitalize="none" placeholder="Enter your email" onChangeText={(email) => setEmail(email)} />
      </YStack>

      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={() => signInWithLink(email)} className={"w-full"}>
        Send magic link
      </Button>

      <YStack className="flex items-center justify-center" space={8}>
        <XStack>
          <Text>Remember your credentials? </Text>
          <Text className="font-bold" onPress={() => router.push("auth/login")}>
            Login Here
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
