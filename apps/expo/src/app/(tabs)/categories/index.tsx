import React from "react";
import { RefreshControl } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

export default function Categories() {
  const router = useRouter();
  const { data: categories, isLoading, refetch, isRefetching } = api.category.getAll.useQuery();

  if (isLoading) return <Spinner background />;
  if (!categories) return <NoData background>No categories found</NoData>;

  return (
    <ScrollView
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <YStack space className="p-4">
        {categories?.map((category) => (
          <CardItemWide
            key={category.id}
            onPress={() => router.push(`/categories/${category.id}`)}
            title={trimString(category.name, 16)}
            text1={trimString(`${category._count.products} products`, 18)}
            image={`${Constants.expoConfig?.extra?.CATEGORY_ICON}/${category.id}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
