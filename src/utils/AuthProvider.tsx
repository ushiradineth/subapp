import React, { createContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";

type ContextProps = {
  user: null | boolean;
  session: Session | null;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [user, setUser] = useState<null | boolean>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then((e) => {
      setSession(e.data.session);
      setUser(e.data.session ? true : false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: React.SetStateAction<Session | null>) => {
      console.log(`Supabase auth event: ${event}`);
      setSession(session);
      setUser(session ? true : false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
