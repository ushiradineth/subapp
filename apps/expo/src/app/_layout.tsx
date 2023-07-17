import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Text, View } from "react-native";
import { Stack, usePathname, useRouter, type ErrorBoundaryProps } from "expo-router";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import moment from "moment";

import { ThemeProvider } from "~/utils/ThemeProvider";
import { TRPCProvider } from "~/utils/api";

type Session = {
  id: string;
  email: string;
  name: string;
  token: string;
  expiration: number;
};

type Status = "loading" | "authenticated" | "unauthenticated";

export const AuthContext = createContext<{
  session: Session;
  setSession: (arg0: Session) => void;
  logout: () => void;
  status: "loading" | "authenticated" | "unauthenticated";
}>({
  session: { id: "", email: "", name: "", token: "", expiration: 0 },
  setSession: () => undefined,
  logout: () => undefined,
  status: "loading",
});

const RootLayout = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<Session>({
    id: "",
    email: "",
    name: "",
    token: "",
    expiration: 0,
  });
  const [status, setStatus] = useState<Status>("loading");

  // Logout callback to clear out the securestore values and session object, and to change the status
  const logout = useCallback(async () => {
    setSession({ email: "", id: "", name: "", token: "", expiration: 0 });
    setStatus("unauthenticated");
    await deleteItemAsync("id");
    await deleteItemAsync("email");
    await deleteItemAsync("name");
    await deleteItemAsync("token");
    await deleteItemAsync("expiration");
  }, []);

  // Memoized auth object to pass down to the Auth context provider
  const memoizedAuthObject = useMemo(() => {
    return {
      session,
      setSession,
      logout,
      status,
    };
  }, [logout, session, status]);

  // UEF to get session key values from the securestore for verification
  useEffect(() => {
    const initSession = async () => {
      setStatus("loading");
      const id = await getItemAsync("id");
      const email = await getItemAsync("email");
      const name = await getItemAsync("name");
      const token = await getItemAsync("token");
      const expiration = await getItemAsync("expiration");
      setSession({ email: email ?? "", id: id ?? "", name: name ?? "", token: token ?? "", expiration: Number(expiration ?? 0) });

      if (token !== "" && Number(expiration) > moment.now()) {
        setStatus("authenticated");
      } else {
        await logout();
      }
    };

    void initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UEF to update the securestore with the session key values
  useEffect(() => {
    const updateStore = async () => {
      setStatus("loading");
      await setItemAsync("id", session.id);
      await setItemAsync("email", session.email);
      await setItemAsync("name", session.name);
      await setItemAsync("token", session.token);
      await setItemAsync("expiration", String(session.expiration));
      if (session.token !== "") setStatus("authenticated");
      else setStatus("unauthenticated");
    };

    void updateStore();
  }, [session]);

  if (status === "unauthenticated" && session.token === "" && !pathname.includes("/auth")) {
    return router.replace("/auth");
  }

  return (
    <AuthContext.Provider value={memoizedAuthObject}>
      <TRPCProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[productId]" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
          <StatusBar />
        </ThemeProvider>
      </TRPCProvider>
    </AuthContext.Provider>
  );
};

export default RootLayout;

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <View className="flex h-screen items-center justify-center">
      <View className="flex items-center justify-center">
        <Text className="text-2xl">Something went wrong.</Text>
        <Text className="text-lg">{props.error.message}</Text>
      </View>
      <Button onPress={props.retry} title="Retry" />
    </View>
  );
}
