import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { Adapt, Button, Dialog, Fieldset, H2, H6, Input, Sheet, Text, Unspaced, XStack, YStack } from "tamagui";

export default function Register() {
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    error !== "" && setError("");
  }, [email, password]);

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signup = await signUp.create({
        emailAddress: email,
        password,
      });

      signUp.prepareEmailAddressVerification();
      setEmailSent(true);
    } catch (err) {
      // @ts-ignore
      setError(`Error: ${err.errors ? err.errors[0].message : err}`);
    }
  };

  const confirmOTP = (code: string) => {
    if (!isLoaded) {
      return false;
    }

    try {
      signUp.attemptEmailAddressVerification({
        code,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      {emailSent && <EmailSentPopup onConfirm={confirmOTP} open={true} />}
      <H2 className="text-center text-2xl font-bold">Register</H2>

      <YStack className="w-full">
        <H6 className="font-bold">Email</H6>
        <Input className="w-full" value={email} autoCapitalize="none" placeholder="Enter your email" onChangeText={(email) => setEmail(email)} />
      </YStack>

      <YStack className="w-full">
        <H6 className="font-bold">Password</H6>
        <Input className="w-full" value={password} placeholder="Enter your Password" secureTextEntry={true} onChangeText={(password) => setPassword(password)} />
      </YStack>

      {error && <Text color={"red"}>{error}</Text>}

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

const EmailSentPopup = (props: { onConfirm: (code: string) => boolean; open: boolean }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    error !== "" && setError("");
  }, [code]);

  async function handleConfirm() {
    const result = props.onConfirm(code);

    if (!result) {
      setError("Invalid Verification Code");
    }
  }

  return (
    <Dialog modal open={props.open}>
      <Adapt when="sm" platform="touch">
        <Sheet zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" space>
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          space>
          <Dialog.Title>Confirm your Identity</Dialog.Title>
          <Dialog.Description>Check your email for the verification code.</Dialog.Description>
          <Fieldset space="$4" horizontal>
            <Input flex={1} defaultValue="******" value={code} onChangeText={(code) => setCode(code)} placeholder="Verification Code" />
          </Fieldset>
          <YStack alignItems="center" marginTop="$2">
            {error && <Text color={"red"}>{error}</Text>}
          </YStack>
          <YStack alignItems="flex-end" marginTop="$2">
            <Dialog.Close displayWhenAdapted asChild>
              <Button theme="alt1" aria-label="Close" onPress={() => handleConfirm()}>
                Confirm
              </Button>
            </Dialog.Close>
          </YStack>

          <Unspaced>
            <Dialog.Close asChild>
              <Button position="absolute" top="$3" right="$3" size="$2" circular />
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
