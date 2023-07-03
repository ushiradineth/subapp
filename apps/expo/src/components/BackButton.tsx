import React from "react";
import { Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      className={`rounded-full hover:bg-zinc-300 active:bg-zinc-200 ${Platform.OS === "android" ? "px-2 pb-2 pt-1" : "p-2"}`}>
      <View className="">
        <ArrowLeft className={` ${Platform.OS === "android" && "mt-1"}`} color={"black"} />
      </View>
    </Pressable>
  );
};

export default BackButton;
