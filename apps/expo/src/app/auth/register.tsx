import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, H2, H6, Input, ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { RegisterSchema, type RegisterFormData } from "~/utils/validators";
import { Spinner } from "~/components/Atoms/Spinner";

export default function Register() {
  const router = useRouter();

  const [error, setError] = useState("");
  const { mutate, isLoading } = api.user.register.useMutation({
    onSuccess() {
      router.push("auth/login");
    },
    onError(error) {
      setError(error.message);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(RegisterSchema),
  });

  const onSubmit = (data: RegisterFormData) => mutate({ email: data.Email, password: data.Password, name: data.Name });

  const onInputChange = useCallback(
    (input: string, onChange: (input: string) => void) => {
      error !== "" && setError("");
      onChange(input);
    },
    [error],
  );

  return (
    <ScrollView backgroundColor="$background" padding="$4" borderRadius="$4">
      <YStack className="flex items-center justify-center p-8" space>
        <H2 className="text-center text-2xl font-bold">Register</H2>

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Name</H6>
              <Input
                className="my-1"
                placeholder="Name"
                autoCapitalize={"none"}
                onBlur={onBlur}
                onChangeText={(input) => onInputChange(input, onChange)}
                value={value}
              />
              <YStack className="flex items-center justify-center">
                {errors.Name && <Text color={"red"}>{errors.Name.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Name"
        />

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Email</H6>
              <Input
                className="my-1"
                placeholder="Email"
                autoCapitalize={"none"}
                onBlur={onBlur}
                onChangeText={(input) => onInputChange(input, onChange)}
                value={value}
              />
              <YStack className="flex items-center justify-center">
                {errors.Email && <Text color={"red"}>{errors.Email.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Email"
        />

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Password</H6>
              <Input
                className="my-1"
                placeholder="Password"
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

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Confirm Password</H6>
              <Input
                className="my-1"
                placeholder="Confirm Password"
                autoCapitalize={"none"}
                secureTextEntry={true}
                onBlur={onBlur}
                onChangeText={(input) => onInputChange(input, onChange)}
                value={value}
              />
              <YStack className="flex items-center justify-center">
                {errors.ConfirmPassword && <Text color={"red"}>{errors.ConfirmPassword.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="ConfirmPassword"
        />

        <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={handleSubmit(onSubmit)} className={"w-full"}>
          {isLoading ? <Spinner color="white" /> : "Register"}
        </Button>

        {error !== "" && <Text color={"red"}>{error}</Text>}

        <YStack className="flex items-center justify-center" space={8}>
          <XStack>
            <Text>Already have an account? </Text>
            <Text className="font-bold" onPress={() => router.push("auth/login")}>
              Login Here
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
