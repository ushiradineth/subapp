import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, H2, H6, Input, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { LoginSchema, type LoginFormData } from "~/utils/validators";
import { Spinner } from "~/components/Atoms/Spinner";
import { AuthContext } from "../_layout";

export default function Login() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const [error, setError] = useState("");
  const { mutate, isLoading } = api.user.authorize.useMutation({
    onSuccess(data) {
      auth.setSession({ id: data.id, email: data.email, name: data.name });
      router.push("/home");
    },
    onError(error) {
      setError(error.message);
    },
  });

  console.log(auth.session);

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema),
  });

  const onSubmit = (data: LoginFormData) => mutate({ email: data.Email, password: data.Password });

  useEffect(() => {
    error !== "" && setError("");
  }, [watch("Email"), watch("Password")]);

  return (
    <YStack className="flex-1 items-center justify-center p-8" space backgroundColor="$background">
      <H2 className="text-center text-2xl font-bold">Login</H2>

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

      <Controller
        control={control}
        rules={{
          maxLength: 100,
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

      <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={handleSubmit(onSubmit)} className={"w-full"}>
        {isLoading ? <Spinner color="white" /> : "Log in"}
      </Button>

      {error !== "" && <Text color={"red"}>{error}</Text>}

      <YStack className="flex items-center justify-center" space={8}>
        <XStack>
          <Text>Don&apos;t have an account? </Text>
          <Text className="font-bold" onPress={() => router.push("auth/register")}>
            Register here
          </Text>
        </XStack>
        <Text className="font-bold" onPress={() => router.push("auth/reset")}>
          Reset password
        </Text>
      </YStack>
    </YStack>
  );
}
