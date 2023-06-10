import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, H2, H6, Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { RegisterSchema, type RegisterFormData } from "~/utils/validators";

export default function Register() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);

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
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(RegisterSchema),
  });

  const onSubmit = (data: RegisterFormData) => mutate({ email: data.Email, password: data.Password, name: data.Name });

  useEffect(() => {
    error !== "" && setError("");
  }, [watch("Email"), watch("Password"), watch("Email"), watch("Password")]);

  // const confirmOTP = (code: string) => {
  //   if (!isLoaded) {
  //     return false;
  //   }

  //   try {
  //     signUp.attemptEmailAddressVerification({
  //       code,
  //     });
  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // };

  return (
    <ScrollView backgroundColor="$background" padding="$4" borderRadius="$4">
      <YStack className="flex items-center justify-center p-8" space>
        {/* {emailSent && <EmailSentPopup onConfirm={confirmOTP} open={true} />} */}
        <H2 className="text-center text-2xl font-bold">Register</H2>

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Name</H6>
              <Input className="my-1" placeholder="Name" autoCapitalize={"none"} onBlur={onBlur} onChangeText={onChange} value={value} />
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
                onChangeText={onChange}
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

// const EmailSentPopup = (props: { onConfirm: (code: string) => boolean; open: boolean }) => {
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     error !== "" && setError("");
//   }, [code]);

//   async function handleConfirm() {
//     const result = props.onConfirm(code);

//     if (!result) {
//       setError("Invalid Verification Code");
//     }
//   }

//   return (
//     <Dialog modal open={props.open}>
//       <Adapt when="sm" platform="touch">
//         <Sheet zIndex={200000} modal dismissOnSnapToBottom>
//           <Sheet.Frame padding="$4" space>
//             <Adapt.Contents />
//           </Sheet.Frame>
//           <Sheet.Overlay />
//         </Sheet>
//       </Adapt>

//       <Dialog.Portal>
//         <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />

//         <Dialog.Content
//           bordered
//           elevate
//           key="content"
//           animation={[
//             "quick",
//             {
//               opacity: {
//                 overshootClamping: true,
//               },
//             },
//           ]}
//           enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
//           exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
//           space>
//           <Dialog.Title>Confirm your Identity</Dialog.Title>
//           <Dialog.Description>Check your email for the verification code.</Dialog.Description>
//           <Fieldset space="$4" horizontal>
//             <Input flex={1} defaultValue="******" value={code} onChangeText={(code) => setCode(code)} placeholder="Verification Code" />
//           </Fieldset>
//           <YStack alignItems="center" marginTop="$2">
//             {error && <Text color={"red"}>{error}</Text>}
//           </YStack>
//           <YStack alignItems="flex-end" marginTop="$2">
//             <Dialog.Close displayWhenAdapted asChild>
//               <Button theme="alt1" aria-label="Close" onPress={() => handleConfirm()}>
//                 Confirm
//               </Button>
//             </Dialog.Close>
//           </YStack>

//           <Unspaced>
//             <Dialog.Close asChild>
//               <Button position="absolute" top="$3" right="$3" size="$2" circular />
//             </Dialog.Close>
//           </Unspaced>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog>
//   );
// };
