import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Adapt, Button, Dialog, Fieldset, H2, H6, Input, Sheet, Text, Unspaced, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { ForgetPasswordSchema, ResetPasswordSchema, type ForgetPasswordFormData, type ResetPasswordFormData } from "~/utils/validators";
import { Spinner } from "~/components/Spinner";

export default function PasswordReset() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { mutate, isLoading } = api.user.forgotPassword.useMutation({
    onSuccess: () => setEmailSent(true),
    onError: (error) => setError(error.message),
  });

  const {
    control,
    watch,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>({
    resolver: yupResolver(ForgetPasswordSchema),
  });

  const onSubmit = (data: ForgetPasswordFormData) => mutate({ email: data.Email });

  useEffect(() => {
    error !== "" && setError("");
  }, [watch("Email")]);

  return (
    <YStack className="flex-1 items-center justify-center p-8" space>
      {emailSent && <EmailSentPopup open={true} setOpen={setEmailSent} email={getValues("Email")} />}
      <H2 className="text-center text-2xl font-bold">Reset Password</H2>

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <YStack className="w-full">
            <H6 className="font-bold">Email</H6>
            <Input className="my-1" placeholder="Email" autoCapitalize={"none"} onBlur={onBlur} onChangeText={onChange} value={value} />
            <YStack className="flex items-center justify-center">
              {errors.Email && <Text color={"red"}>{errors.Email.message}</Text>}
            </YStack>
          </YStack>
        )}
        name="Email"
      />

      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={handleSubmit(onSubmit)} className={"w-full"}>
        {isLoading ? <Spinner color="white" /> : "Continue"}
      </Button>

      {error && <Text color={"red"}>{error}</Text>}

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

interface EmailSentPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  email: string;
}

const EmailSentPopup = ({ email, open, setOpen }: EmailSentPopupProps) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { mutate } = api.user.resetPassword.useMutation({ onSuccess: () => setSuccess(true), onError: (error) => setError(error.message) });

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(ResetPasswordSchema),
  });

  useEffect(() => {
    error !== "" && setError("");
  }, [watch("OTP"), watch("Password")]);

  const onSubmit = (data: ResetPasswordFormData) => mutate({ otp: data.OTP, password: data.Password, email: email });

  return (
    <Dialog modal open={open} onOpenChange={(open) => setOpen(open)}>
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
          <Fieldset space="$4" horizontal></Fieldset>

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack className="w-full">
                <H6 className="font-bold">Verification Code</H6>
                <Input
                  className="my-1"
                  placeholder="Verification Code"
                  autoCapitalize={"none"}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                <YStack className="flex items-center justify-center">
                  {errors.OTP && <Text color={"red"}>{errors.OTP.message}</Text>}
                </YStack>
              </YStack>
            )}
            name="OTP"
          />

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack className="w-full">
                <H6 className="font-bold">New Password</H6>
                <Input
                  className="my-1"
                  placeholder="Enter your new password"
                  autoCapitalize={"none"}
                  secureTextEntry={true}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                <YStack className="flex items-center justify-center">
                  {errors.Password && <Text color={"red"}>{errors.Password.message}</Text>}
                </YStack>
              </YStack>
            )}
            name="Password"
          />

          <YStack alignItems="center" marginTop="$2">
            {error && <Text color={"red"}>{error}</Text>}
            {success && <Text color={"green"}>{"Your password has been updated"}</Text>}
          </YStack>

          <YStack alignItems="flex-end" marginTop="$2">
            {!success ? (
              <Button theme="alt1" aria-label="Close" onPress={handleSubmit(onSubmit)}>
                Change Password
              </Button>
            ) : (
              <Link href={"/auth/login"} asChild>
                <Button theme="alt1" aria-label="Close">
                  Back to the Login Page
                </Button>
              </Link>
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
