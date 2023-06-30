import React, { useContext } from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import NoData from "~/components/NoData";
import { Spinner } from "~/components/Spinner";
import CardItemWide from "~/components/ui/card-item-wide/CardItemWide";
import { AuthContext } from "~/app/_layout";

export default function Wishlist() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { data, isLoading } = api.user.wishlist.useQuery({ id: auth.session.id });

  if (isLoading) return <Spinner background />;
  if (data?.wishlist?.length === 0) return <NoData>No products found</NoData>;

  return (
    <ScrollView backgroundColor={"$background"}>
      <YStack space className="p-4">
        {data?.wishlist?.map((product) => (
          <CardItemWide
            key={product.id}
            onPress={() => router.push(`product/${product.id}`)}
            title={product.name}
            text1={product.category.name}
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
