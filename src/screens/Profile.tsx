import React from "react";
import { View } from "react-native";
import { Layout, Text } from "react-native-rapi-ui";

export default function ({ navigation }: any) {
  return (
    <Layout>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text>This is the Profile tab</Text>
      </View>
    </Layout>
  );
}
