import React from "react";
import { ActivityIndicator } from "react-native";
import { Stack } from "tamagui";

export default function () {
  return (
    <Stack style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </Stack>
  );
}
