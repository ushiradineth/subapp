import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { styled } from "nativewind";
const StyledView = styled(View);
const StyledText = styled(Text);

export default function App() {
  return (
    <StyledView className="flex-1 items-center justify-center bg-red-300">
      <StyledText className="font-bold">Hello world.</StyledText>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
