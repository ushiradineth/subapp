import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth, useSignIn, useUser } from "@clerk/clerk-expo";
import { Adapt, Button, Dialog, Fieldset, H2, H6, Input, Sheet, Text, Unspaced, XStack, YStack } from "tamagui";

export default function PasswordReset() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    error !== "" && setError("");
  }, [email]);

  const onEmailInput = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signIn.create({
        strategy: "email_code",
        identifier: email,
      });

      setEmailSent(true);
    } catch (error: any) {
      if (error.errors && error.errors[0].message === "Identifier is invalid.") {
        setError("Email is invalid");
        return;
      }

      setError(`Error: ${error.errors ? error.errors[0].message : error}`);
    }
  };

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      {emailSent && <EmailSentPopup open={true} />}
      <H2 className="text-center text-2xl font-bold">Reset Password</H2>

      <YStack className="w-full">
        <H6 className="font-bold">Email</H6>
        <Input className="w-full" value={email} autoCapitalize="none" placeholder="Enter your email" onChangeText={(email) => setEmail(email)} />
      </YStack>

      {error && <Text color={"red"}>{error}</Text>}

      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={onEmailInput} className={"w-full"}>
        Continue
      </Button>

      <YStack className="flex items-center justify-center" space={8}>
        <XStack>
          <Text>Go back to </Text>
          <Text className="font-bold" onPress={() => router.push("auth/login")}>
            Login
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

const EmailSentPopup = (props: { open: boolean }) => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signIn, isLoaded } = useSignIn();
  const { user } = useUser();
  const { signOut } = useAuth();

  useEffect(() => {
    error !== "" && setError("");
  }, [password, code]);

  async function handleOTP() {
    if (!isLoaded) {
      return false;
    }

    try {
      await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      setOtpSuccess(true);
    } catch (error) {
      setOtpSuccess(false);
      setError("Invalid Verification Code");
    }
  }

  async function handlePassword() {
    if (!isLoaded) {
      return false;
    }

    try {
      if (otpSuccess) {
        await user?.updatePassword({ newPassword: password });
        await signOut();
        setSuccess(true);
      }
    } catch (error) {
      setError("Invalid Password")
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
          <Button theme={otpSuccess ? "green_Button" : "alt1"} disabled={otpSuccess} onPress={() => handleOTP()}>
            {otpSuccess ? "Confirmed" : "Verify OTP"}
          </Button>

          <YStack className="w-full">
            <H6 className="font-bold">New Password</H6>
            <Input className="w-full" value={password} autoCapitalize="none" secureTextEntry={true} placeholder="Enter your new password" onChangeText={(password) => setPassword(password)} />
          </YStack>
          <YStack alignItems="center" marginTop="$2">
            {error && <Text color={"red"}>{error}</Text>}
            {success && <Text color={"green"}>{"Your password has been updated"}</Text>}
          </YStack>
          <YStack alignItems="flex-end" marginTop="$2">
            {!success ? (
              <Dialog.Close displayWhenAdapted asChild>
                <Button theme="alt1" aria-label="Close" disabled={!otpSuccess} onPress={() => handlePassword()}>
                  Change Password
                </Button>
              </Dialog.Close>
            ) : (
              <Dialog.Close displayWhenAdapted asChild>
                <Link href={"/auth/login"} asChild>
                  <Button theme="alt1" aria-label="Close">
                    Back to the Login Page
                  </Button>
                </Link>
              </Dialog.Close>
            )}
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
