import React from "react";
import { Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { theme } from "~/utils/consts";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()}>
      <ArrowLeft className={Platform.OS === "android" ? "mt-1" : ""} color={theme.colors.accent} />
    </Pressable>
  );
};

export default BackButton;
