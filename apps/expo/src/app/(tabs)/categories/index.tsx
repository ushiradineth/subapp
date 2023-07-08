import React from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

export default function Categories() {
  const router = useRouter();
  const { data: categories, isLoading } = api.category.getAll.useQuery();

  if (isLoading) return <Spinner background />;
  if (categories?.length === 0) return <NoData>No Categories found</NoData>;

  return (
    <ScrollView backgroundColor={"$background"}>
      <YStack space className="p-4">
        {categories?.map((category) => (
          <CardItemWide
            key={category.id}
            onPress={() => router.push(`/categories/${category.id}`)}
            title={category.name}
            text1={`${category._count.products} products`}
            image={`${Constants.expoConfig?.extra?.CATEGORY_ICON}/${category.id}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
