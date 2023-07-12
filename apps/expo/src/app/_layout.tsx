import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider } from "~/utils/Theme";
import { TRPCProvider } from "~/utils/api";

type Session = {
  id: string;
  email: string;
  name: string;
};

type Status = "loading" | "authenticated" | "unauthenticated";

export const AuthContext = createContext<{
  session: Session;
  setSession: (arg0: Session) => void;
  logout: () => void;
  status: "loading" | "authenticated" | "unauthenticated";
}>({ session: { id: "", email: "", name: "" }, setSession: () => undefined, logout: () => undefined, status: "loading" });

const RootLayout = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<Session>({
    id: "",
    email: "",
    name: "",
  });
  const [status, setStatus] = useState<Status>("loading");

  const logout = useCallback(async () => {
    setSession({ email: "", id: "", name: "" });
    setStatus("unauthenticated");
    await deleteItemAsync("id");
    await deleteItemAsync("email");
    await deleteItemAsync("name");
  }, []);

  const memoizedAuthObject = useMemo(() => {
    return {
      session,
      setSession,
      logout,
      status,
    };
  }, [logout, session, status]);

  useEffect(() => {
    const initSession = async () => {
      setStatus("loading");
      const id = await getItemAsync("id");
      const email = await getItemAsync("email");
      const name = await getItemAsync("name");
      setSession({ email: email ?? "", id: id ?? "", name: name ?? "" });
      if (id !== "") setStatus("authenticated");
      else setStatus("unauthenticated");
    };

    if (session.id === "") {
      initSession();
    }
  }, []);

  useEffect(() => {
    const updateStore = async () => {
      setStatus("loading");
      await setItemAsync("id", session.id);
      await setItemAsync("email", session.email);
      await setItemAsync("name", session.name);
      if (session.id !== "") setStatus("authenticated");
      else setStatus("unauthenticated");
    };
    updateStore();
  }, [session]);

  useEffect(() => {
    console.log(session, status);
  }, [status]);

  if (status === "unauthenticated" && session.id === "" && !pathname.includes("/auth")) {
    return router.replace("/auth");
  }

  return (
    <AuthContext.Provider value={memoizedAuthObject}>
      <TRPCProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
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
