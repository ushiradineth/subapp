import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";

// import SecondScreen from "../screens/SecondScreen";

const MainStack = createNativeStackNavigator();

const Main = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      {/* <MainStack.Screen name="SecondScreen" component={SecondScreen} /> */}
    </MainStack.Navigator>
  );
};

export default Main;
