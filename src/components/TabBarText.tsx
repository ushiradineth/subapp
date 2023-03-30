import React from "react";
import { Text } from "tamagui";

export default ({ title, focused }: { title: string; focused: boolean }) => {
  return (
    <Text
      fontWeight="bold"
      style={{
        marginBottom: 5,
        fontSize: 10,
      }}>
      {title}
    </Text>
  );
};
