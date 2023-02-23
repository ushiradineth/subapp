import { Text, View } from "react-native";

export default function ProfileScreen({ navigation, route }: any) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{route.params.name}</Text>
    </View>
  );
}
