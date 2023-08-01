import React, { useCallback, useContext, useEffect, useState } from "react";
import { Platform, Pressable } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { XIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, Image, Input, ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { getPayload } from "~/utils/utils";
import { UserSchema, type UserFormData } from "~/utils/validators";
import { Spinner } from "~/components/Atoms/Spinner";
import { AuthContext } from "~/app/_layout";

const EditProfile = () => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { mutate, isLoading } = api.user.update.useMutation({
    onSuccess: (data) => {
      router.back();
      Toast.show({ type: "success", text1: "Profile has been updated" });
      auth.setSession({ ...auth.session, name: data.name });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed to update profile" }),
  });

  const { mutateAsync: getUploadUrl } = api.s3.createUploadUrl.useMutation();
  const { mutate: deleteImage } = api.s3.deleteObject.useMutation({
    onError: () => Toast.show({ type: "error", text1: "Failed to update profile" }),
    onSuccess: () => setImageRemoved(true),
  });

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
  }, []);

  const { control, handleSubmit } = useForm<UserFormData>({
    resolver: yupResolver(UserSchema),
    defaultValues: {
      Name: auth.session.name,
    },
  });

  const onSubmit = useCallback(
    async (data: UserFormData) => {
      auth.session.name !== data.Name && mutate({ id: auth.session.id, name: data.Name });

      if (image) {
        setUploading(true);

        const UploadPayload = await getUploadUrl({
          bucket: String(Constants.expoConfig?.extra?.USER_ICON).split("https://")[1]?.split(".s3")[0] ?? "",
          fileName: `${auth.session.id}.jpg`,
          sizeLimit: 25 * 1024 * 1024, // default limit of 25 MB
        });

        try {
          await axios.post(UploadPayload.url, getPayload(image, UploadPayload.fields));
          router.back();
          Toast.show({ type: "success", text1: "Profile has been updated" });
        } catch (error) {
          router.back();
          const err = error as any;
          String(err?.response?.data).includes("EntityTooLarge")
            ? Toast.show({ type: "error", text2: "Maximum image size is 25MB" })
            : Toast.show({ type: "error", text2: "Error uploading profile image" });
        }
        setUploading(false);
      }
    },
    [auth.session.id, auth.session.name, getUploadUrl, image, mutate, router],
  );

  const onDelete = useCallback(() => {
    deleteImage({
      bucket: String(Constants.expoConfig?.extra?.USER_ICON).split("https://")[1]?.split(".s3")[0] ?? "",
      fileName: `${auth.session.id}.jpg`,
    });
  }, [auth.session.id, deleteImage]);

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
      setImageRemoved(false);
    }
  }, []);

  return (
    <ScrollView className="h-fit px-4 py-6" backgroundColor="$background" space>
      <YStack className="bg-background rounded-xl p-4" space>
        <XStack className="flex items-center justify-center" space={"$4"}>
          <Pressable onPress={() => onDelete()}>
            <XIcon color={theme.colors.accent} />
          </Pressable>
          <Image
            source={{
              width: 144,
              height: 144,
              uri: imageRemoved ? "" : image ? image.uri : `${Constants.expoConfig?.extra?.USER_ICON}/${auth.session.id}.jpg`,
            }}
            alt={auth.session.name}
            className="bg-foreground h-16 w-16 rounded-full"
          />
          <Pressable onPress={pickImage}>
            <Text className="text-accent text-sm font-bold">Change Profile Image</Text>
          </Pressable>
        </XStack>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input onBlur={onBlur} autoCapitalize="none" onChangeText={onChange} value={value} placeholder={"Name"} onChange={onChange} />
          )}
          name="Name"
        />
      </YStack>
      <Button onPress={handleSubmit(onSubmit)} className="bg-background h-16 w-full">
        {isLoading || uploading ? <Spinner /> : "Update Profile"}
      </Button>
      {Platform.OS === "ios" && <StatusBar style="light" />}
    </ScrollView>
  );
};

export default EditProfile;
