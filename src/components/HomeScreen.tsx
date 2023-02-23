import { View, Button, Text } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen</Text>
      <Button title="Go to Jane's profile" onPress={() => navigation.navigate("profile", { name: "asd" })} />
    </View>
  );
}
