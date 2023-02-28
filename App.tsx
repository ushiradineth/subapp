import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/components/HomeScreen";
import ProfileScreen from "./src/components/ProfileScreen";
import AuthScreen from "./src/components/AuthScreen";
import { NativeBaseProvider } from "native-base";

type RootStackParamList = {
  Home: undefined;
  Profile: { name: string };
  Authentication: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isSignedIn = true;

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isSignedIn ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            <Stack.Screen name="Authentication" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

export default App;
