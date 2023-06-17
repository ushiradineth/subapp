import React from "react";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable className="mt-1" onPress={() => router.back()}>
      <ArrowLeft />
    </Pressable>
  );
};

export default BackButton;
