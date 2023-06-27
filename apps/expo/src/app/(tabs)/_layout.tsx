import { Tabs, usePathname } from "expo-router";
import { Coins, Home, LayoutDashboard, List, User } from "lucide-react-native";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: () => (pathname.startsWith("/home") ? <Home color="black" strokeWidth={2.5} /> : <Home color="black" />),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          headerShown: false,
          tabBarLabel: "Lists",
          tabBarIcon: () =>
            pathname.startsWith("/lists") ? <List color="black" strokeWidth={2.5} /> : <List color="black" strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          headerShown: false,
          tabBarLabel: "Bills",
          tabBarIcon: () => (pathname.startsWith("/bills") ? <Coins color="black" strokeWidth={2.5} /> : <Coins color="black" />),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          headerShown: false,
          tabBarLabel: "Categories",
          tabBarIcon: () =>
            pathname.startsWith("/categories") ? <LayoutDashboard color="black" strokeWidth={2.5} /> : <LayoutDashboard color="black" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: () => (pathname.startsWith("/profile") ? <User color="black" strokeWidth={2.5} /> : <User color="black" />),
        }}
      />
    </Tabs>
  );
}
