import React, { useCallback, useState } from "react";
import { Platform } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, H6, Input, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { ResetPasswordSchema, type ResetPasswordFormData } from "~/utils/validators";
import { Spinner } from "~/components/Atoms/Spinner";

const Verify = () => {
  const { email } = useLocalSearchParams();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { mutate, isLoading } = api.user.resetPassword.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (error) => setError(error.message),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(ResetPasswordSchema),
  });

  const onInputChange = useCallback(
    (input: string, onChange: (input: string) => void) => {
      error !== "" && setError("");
      onChange(input);
    },
    [error],
  );

  const onSubmit = (data: ResetPasswordFormData) => mutate({ otp: data.OTP, password: data.Password, email: (email as string) ?? "" });

  return (
    <YStack className="h-full p-8" space backgroundColor={"$background"}>
      {Platform.OS === "ios" && <StatusBar style="light" />}
      <YStack>
        <Text className="text-2xl font-bold">Confirm your Identity</Text>
        <Text>Check your email for the verification code.</Text>
      </YStack>

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
              onChangeText={(input) => onInputChange(input, onChange)}
              value={value}
            />
            <YStack className="flex items-center justify-center">{errors.OTP && <Text color={"red"}>{errors.OTP.message}</Text>}</YStack>
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
              onChangeText={(input) => onInputChange(input, onChange)}
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
        {Boolean(error) && <Text color={"red"}>{error}</Text>}
        {success && <Text color={"green"}>{"Your password has been updated"}</Text>}
      </YStack>

      <YStack alignItems="flex-end" marginTop="$2">
        {!success ? (
          <Button theme="alt1" aria-label="Close" onPress={handleSubmit(onSubmit)}>
            {isLoading ? <Spinner /> : "Change Password"}
          </Button>
        ) : (
          <Link href={"/auth/login"} asChild>
            <Button theme="alt1" aria-label="Close">
              Back to the Login Page
            </Button>
          </Link>
        )}
      </YStack>
    </YStack>
  );
};

export default Verify;
