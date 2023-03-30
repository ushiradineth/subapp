import React from "react";
import TabBarIcon from "@/components/TabBarIcon";
import TabBarText from "@/components/TabBarText";
import About from "@/screens/About";
import Home from "@/screens/Home";
import Profile from "@/screens/Profile";
import { useTheme } from "@/utils/Theme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tabs = createBottomTabNavigator();
const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        // tabBarStyle: {
        //   borderTopColor: isDarkmode ? themeColor.dark100 : "#c0c0c0",
        //   backgroundColor: isDarkmode ? themeColor.dark200 : "#ffffff",
        // },
      }}>
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Home" />,
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={"md-home"} />,
        }}
      />
      <Tabs.Screen
        name="About"
        component={About}
        options={{
          tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="About" />,
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={"ios-information-circle"} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Profile" />,
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={"person"} />,
        }}
      />
    </Tabs.Navigator>
  );
};

export default MainTabs;
