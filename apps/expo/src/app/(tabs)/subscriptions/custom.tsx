import React, { useCallback, useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { XIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, H6, Image, Input, ScrollView, Spinner, Text, TextArea, ToggleGroup, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { PERIODS, getPayload } from "~/utils/utils";
import { TemplateSchema, type TemplateFormData } from "~/utils/validators";
import { AuthContext } from "~/app/_layout";

const Custom = () => {
  const router = useRouter();
  const { mutate, isLoading, data } = api.template.create.useMutation({
    onError: () => Toast.show({ type: "error", text1: "Failed to create subscription" }),
    onSuccess: (data) => {
      UploadImage(data.template.id);
    },
  });

  const auth = useContext(AuthContext);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { mutateAsync: getUploadUrl } = api.s3.createUploadUrl.useMutation();

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: yupResolver(TemplateSchema),
  });

  const onSubmit = useCallback(
    (data: TemplateFormData) => {
      mutate({ name: data.Name, description: data.Description, price: data.Price, period: data.Period, link: data.Link });
    },
    [mutate],
  );

  const UploadImage = useCallback(
    async (id: string) => {
      if (image) {
        setUploading(true);

        const UploadPayload = await getUploadUrl({
          bucket: String(Constants.expoConfig?.extra?.TEMPLATE_ICON).split("https://")[1]?.split(".s3")[0] ?? "",
          fileName: `${id}.jpg`,
          sizeLimit: 25 * 1024 * 1024, // default limit of 25 MB
        });

        try {
          await axios.post(UploadPayload.url, getPayload(image, UploadPayload.fields));
          router.back();
          Toast.show({ type: "success", text1: "Subscription has been created" });
        } catch (error) {
          router.back();
          const err = error as any;
          String(err?.response?.data).includes("EntityTooLarge")
            ? Toast.show({ type: "error", text2: "Maximum image size is 25MB" })
            : Toast.show({ type: "error", text2: "Error uploading subscription image" });
        }
        setUploading(false);
      }
    },
    [getUploadUrl, image, router],
  );

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0] ?? null);
      setValue("Logo", "Image set");
      setImageRemoved(false);
    }
  }, []);

  return (
    <ScrollView backgroundColor="$background" padding="$4" borderRadius="$4">
      <YStack className="flex items-center justify-center p-8" space>
        <XStack className="flex items-center justify-center" space={"$4"}>
          <Pressable
            onPress={() => {
              setImageRemoved(true);
              setValue("Logo", "");
            }}>
            <XIcon color={theme.colors.accent} />
          </Pressable>
          <Image
            source={{
              width: 144,
              height: 144,
              uri: imageRemoved ? "" : image ? image.uri : `${Constants.expoConfig?.extra?.TEMPLATE_ICON}/${data?.template.id}.jpg`,
            }}
            alt={auth.session.name}
            className="bg-foreground h-16 w-16 rounded-full"
          />

          <YStack>
            <Pressable onPress={pickImage}>
              <Text className="text-accent text-sm font-bold">Add Subscription Image</Text>
            </Pressable>
            {errors.Logo && <Text color={"red"}>{errors.Logo.message}</Text>}
          </YStack>
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
                  <ToggleGroup.Item value={String(PERIODS[0]?.period ?? "")} backgroundColor={"white"} aria-label="Left aligned">
                    <Text>{PERIODS[0]?.period}</Text>
                  </ToggleGroup.Item>

                  <ToggleGroup.Item value={String(PERIODS[1]?.period ?? "")} backgroundColor={"white"} aria-label="Center aligned">
                    <Text>{PERIODS[1]?.period}</Text>
                  </ToggleGroup.Item>

                  <ToggleGroup.Item value={String(PERIODS[2]?.period ?? "")} backgroundColor={"white"} aria-label="Center aligned">
                    <Text>{PERIODS[2]?.period}</Text>
                  </ToggleGroup.Item>

                  <ToggleGroup.Item value={String(PERIODS[3]?.period ?? "")} backgroundColor={"white"} aria-label="Right aligned">
                    <Text>{PERIODS[3]?.period}</Text>
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
          {isLoading || uploading ? <Spinner color="white" /> : "Subscribe"}
        </Button>
      </YStack>
    </ScrollView>
  );
};

export default Custom;
