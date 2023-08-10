import React from "react";
import { Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable
      android_ripple={{ color: "gray", borderless: true, radius: 20 }}
      onPress={() => router.back()}
      className={`rounded-full ${Platform.OS === "android" ? "px-2 pb-2 pt-1" : "p-2"}`}>
      <ArrowLeft className={` ${Platform.OS === "android" && "mt-1"}`} color={"black"} />
    </Pressable>
  );
};

export default BackButton;
