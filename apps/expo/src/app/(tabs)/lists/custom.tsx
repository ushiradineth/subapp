import React, { useContext, useState } from "react";
import { Pressable } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { type ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { XIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, H6, Image, Input, ScrollView, Spinner, Text, TextArea, ToggleGroup, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { supabase } from "~/utils/supabase";
import { TemplateSchema, type TemplateFormData } from "~/utils/validators";
import { AuthContext } from "~/app/_layout";

export const PERIODS = [
  { period: "1", label: "Daily" },
  { period: "7", label: "Weekly" },
  { period: "28", label: "Monthly" },
  { period: "365", label: "Annually" },
];

const Custom = () => {
  const router = useRouter();
  const { mutate, isLoading, data } = api.template.create.useMutation({
    onError: () => Toast.show({ type: "error", text1: "Failed to create custom subscription" }),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Subscription Created" });
      router.back();
    },
  });

  const auth = useContext(AuthContext);
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: yupResolver(TemplateSchema),
  });

  const onSubmit = (data: TemplateFormData) => {
    console.log(data);

    mutate({ name: data.Name, description: data.Description, price: data.Price, period: data.Period, link: data.Link });
    // if (image) {
    //   setUploading(true);
    //   const response = await fetch(image.uri);
    //   const blob = await response.blob();

    //   const body = new FormData();
    //   // @ts-expect-error
    //   body.append("file", {
    //     uri: image.uri,
    //     name: blob.name,
    //     type: blob.type,
    //   });

    //   const { data, error } = await supabase.storage
    //     .from(Constants.expoConfig?.extra?.USER_ICON_BUCKET)
    //     .upload(`${auth.session.id}/0.jpg`, body);

    //   setUploading(false);

    //   console.log(data, error);

    //   if (error) Toast.show({ type: "error", text1: "Failed to update profile" });
    // }
  };

  const onDelete = async () => {
    const { data, error } = await supabase.storage
      .from(Constants.expoConfig?.extra?.TEMPLATE_ICON_BUCKET)
      .remove([`${auth.session.id}/0.jpg`]);

    if (error) Toast.show({ type: "error", text1: "Failed to update profile" });

    setImageRemoved(true);
  };

  // const pickImage = useCallback(async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setImage(result.assets[0] ?? null);
  //   }
  // }, []);

  return (
    <ScrollView backgroundColor="$background" padding="$4" borderRadius="$4">
      <YStack className="flex items-center justify-center p-8" space>
        <XStack className="flex items-center justify-center" space={"$4"}>
          <Pressable onPress={() => onDelete()}>
            <XIcon color={theme.colors.accent} />
          </Pressable>
          <Image
            source={{
              width: 144,
              height: 144,
              uri: imageRemoved ? "" : image ? image.uri : `${Constants.expoConfig?.extra?.TEMPLATE_ICON}/${data?.template.id}/0.jpg`,
            }}
            alt={auth.session.name}
            width="100%"
            height="100%"
            className="bg-foreground h-16 w-16 rounded-full"
          />

          {/* {errors.Logo && <Text color={"red"}>{errors.Logo.message}</Text>} */}
          {/* <Pressable onPress={pickImage}>
            <Text className="text-accent text-sm font-bold">Change Profile Image</Text>
          </Pressable> */}
        </XStack>

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
              <H6 className="font-bold">Description</H6>
              <TextArea
                className="my-1"
                placeholder="Description"
                autoCapitalize={"none"}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              <YStack className="flex items-center justify-center">
                {errors.Description && <Text color={"red"}>{errors.Description.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Description"
        />

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Period</H6>
              <XStack flexDirection={"row"} alignItems="center" justifyContent="center">
                <ToggleGroup
                  value={value?.toString()}
                  onValueChange={onChange}
                  orientation={"horizontal"}
                  id={"Period"}
                  type={"single"}
                  size={"$6"}
                  disableDeactivation={true}>
                  <ToggleGroup.Item value={PERIODS[0]?.period ?? ""} backgroundColor={"white"} aria-label="Left aligned">
                    <Text>{PERIODS[0]?.period} </Text>
                  </ToggleGroup.Item>

                  <ToggleGroup.Item value={PERIODS[1]?.period ?? ""} backgroundColor={"white"} aria-label="Center aligned">
                    <Text> {PERIODS[1]?.period}</Text>
                  </ToggleGroup.Item>

                  <ToggleGroup.Item value={PERIODS[2]?.period ?? ""} backgroundColor={"white"} aria-label="Center aligned">
                    <Text> {PERIODS[2]?.period}</Text>
                  </ToggleGroup.Item>

                  <ToggleGroup.Item value={PERIODS[3]?.period ?? ""} backgroundColor={"white"} aria-label="Right aligned">
                    <Text> {PERIODS[3]?.period}</Text>
                  </ToggleGroup.Item>
                </ToggleGroup>
              </XStack>
              <YStack className="flex items-center justify-center">
                {errors.Period && <Text color={"red"}>{errors.Period.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Period"
        />

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Price</H6>
              <Input
                className="my-1"
                placeholder="Price"
                autoCapitalize={"none"}
                onBlur={onBlur}
                keyboardType="numeric"
                onChangeText={onChange}
                value={value?.toString()}
              />
              <YStack className="flex items-center justify-center">
                {errors.Price && <Text color={"red"}>{errors.Price.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Price"
        />

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <YStack className="w-full">
              <H6 className="font-bold">Link</H6>
              <Input
                className="my-1"
                placeholder="Link"
                autoCapitalize={"none"}
                onBlur={onBlur}
                textContentType="URL"
                onChangeText={onChange}
                value={value}
              />
              <YStack className="flex items-center justify-center">
                {errors.Link && <Text color={"red"}>{errors.Link.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Link"
        />

        <Button backgroundColor={"$accent"} fontWeight={"600"} color={"white"} onPress={handleSubmit(onSubmit)} className={"w-full"}>
          {isLoading ? <Spinner color="white" /> : "Subscribe"}
        </Button>
      </YStack>
    </ScrollView>
  );
};

export default Custom;
