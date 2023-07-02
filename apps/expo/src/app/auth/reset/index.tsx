import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, H2, H6, Input, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { ForgetPasswordSchema, type ForgetPasswordFormData } from "~/utils/validators";
import { Spinner } from "~/components/Atoms/Spinner";

export default function PasswordReset() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { mutate, isLoading } = api.user.forgotPassword.useMutation({
    onSuccess: (data) => router.push("auth/reset/verify?email=" + data.email),
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
    <YStack className="flex-1 items-center justify-center p-8" space backgroundColor="$background">
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
