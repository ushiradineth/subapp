import React, { useContext } from "react";
import { RefreshControl } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";
import { AuthContext } from "~/app/_layout";

export default function Wishlist() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { data, isLoading, refetch, isRefetching } = api.user.wishlist.useQuery({ id: auth.session.id });

  if (isLoading) return <Spinner background />;
  if (!data || data?.wishlist?.length === 0) return <NoData background>No products found</NoData>;

  return (
    <ScrollView
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <YStack space className="p-4">
        {data?.wishlist?.map((product) => (
          <CardItemWide
            key={product.id}
            onPress={() => {
              router.back();
              router.replace(`product/${product.id}`);
            }}
            title={trimString(product.name, 20)}
            text1={trimString(product.category.name, 20)}
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
