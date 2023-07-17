import React, { useContext } from "react";
import { RefreshControl, View } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { H1, ScrollView, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import CardItem from "~/components/Atoms/CardItem";
import NoData from "~/components/Atoms/NoData";
import { AuthContext } from "~/app/_layout";

export default function Home() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { data, isLoading, refetch, isRefetching } = api.product.getHomeFeed.useQuery(undefined, {
    enabled: auth.session.id !== "",
    retry: 0,
  });

  return (
    <ScrollView
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <YStack space>
        <H1 className="pl-4 pt-4 text-xl font-semibold">Welcome, {auth.session?.name}</H1>
        <ScrollView className="pl-4" horizontal>
          <XStack className="mr-8" space={"$2"}>
            {!data && (!isLoading || !isRefetching) && (
              <View>
                <NoData background>No products found</NoData>
              </View>
            )}
            {data?.map((product) => (
              <CardItem
                key={product.id}
                onPress={() => router.push(`product/${product.id}`)}
                title={trimString(product.name, 14)}
                text1={trimString(product.category.name, 12)}
                image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}/0.jpg`}
              />
            ))}
          </XStack>
        </ScrollView>
      </YStack>
    </ScrollView>
  );
}
