import React from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()}>
      <ArrowLeft />
    </Pressable>
  );
};

export default BackButton;
