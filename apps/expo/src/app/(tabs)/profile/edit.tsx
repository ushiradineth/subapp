import React, { useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import type * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { yupResolver } from "@hookform/resolvers/yup";
import { XIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, Image, Input, ScrollView, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { supabase } from "~/utils/supabase";
import { UserSchema, type UserFormData } from "~/utils/validators";
import { Spinner } from "~/components/Spinner";
import { AuthContext } from "~/app/_layout";

const EditProfile = () => {
  const auth = useContext(AuthContext);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { mutate, isLoading } = api.user.update.useMutation({
    onSuccess: (data) => {
      Toast.show({ type: "success", text1: "Profile has been updated" });
      auth.setSession({ ...auth.session, name: data.name });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed to update profile" }),
  });

  const { control, handleSubmit, setValue } = useForm<UserFormData>({
    resolver: yupResolver(UserSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    auth.session.name !== data.Name && mutate({ id: auth.session.id, name: data.Name });
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
    const { data, error } = await supabase.storage.from(Constants.expoConfig?.extra?.USER_ICON_BUCKET).remove([`${auth.session.id}/0.jpg`]);

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

  useEffect(() => {
    setValue("Name", auth.session.name);
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
              uri: imageRemoved ? "" : image ? image.uri : `${Constants.expoConfig?.extra?.USER_ICON}/${auth.session.id}/0.jpg`,
            }}
            alt={auth.session.name}
            width="100%"
            height="100%"
            className="bg-foreground h-16 w-16 rounded-full"
          />
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
            <Input onBlur={onBlur} autoCapitalize="none" onChangeText={onChange} value={value} placeholder={"Name"} onChange={onChange} />
          )}
          name="Name"
        />
      </YStack>
      <Button onPress={handleSubmit(onSubmit)} className="bg-background h-16 w-full">
        {isLoading || uploading ? <Spinner /> : "Update Profile"}
      </Button>
      <StatusBar style="light" />
    </ScrollView>
  );
};

export default EditProfile;
