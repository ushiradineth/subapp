import React, { useContext } from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { H1, ScrollView, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { Spinner } from "~/components/Spinner";
import CardItem from "~/components/ui/card-item/CardItem";
import { AuthContext } from "~/app/_layout";

export default function Home() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { data, isLoading } = api.product.getHomeFeed.useQuery(undefined, { enabled: auth.session.id !== "", retry: 0 });

  if (isLoading) return <Spinner background />;

  return (
    <YStack space>
      <H1 className="pl-4 pt-4 text-xl font-semibold">Welcome, {auth.session?.name}</H1>
      <ScrollView className="pl-4" horizontal>
        <XStack className="mr-8" space={"$2"}>
          {data?.map((product) => (
            <CardItem
              key={product.id}
              onPress={() => router.push(`product/${product.id}`)}
              title={product.name}
              text1={product.category.name}
              image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}/0.jpg`}
            />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
