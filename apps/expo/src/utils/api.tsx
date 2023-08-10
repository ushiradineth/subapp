import React, { useContext, useEffect, useMemo } from "react";
import Constants from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import { type AppRouter } from "@acme/api";

import { AuthContext } from "~/app/_layout";

export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@acme/api";

const getBaseUrl = () => {
  const debuggerHost = Constants.manifest?.debuggerHost ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const localhost = debuggerHost?.split(":")[0];
  if (!localhost) {
    return Constants.expoConfig?.extra?.WEB_URL as string;
  }
  return `http://${localhost}:3000`;
};

export const TRPCProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [queryClient] = React.useState(() => new QueryClient());

  const CreateTRPCClient = useMemo(
    () =>
      api.createClient({
        transformer: superjson,
        links: [
          httpBatchLink({
            headers() {
              return {
                authorization: auth.session.token,
              };
            },
            url: `${getBaseUrl()}/api/trpc`,
          }),
        ],
      }),
    [auth.session.token],
  );

  const [trpcClient, setTrpcClient] = React.useState(() => CreateTRPCClient);

  useEffect(() => {
    setTrpcClient(CreateTRPCClient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.session.token]);

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
};
