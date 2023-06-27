import React from "react";
import Constants from "expo-constants";
import { usePathname, useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { Spinner } from "~/components/Spinner";
import CardItemWide from "~/components/ui/card-item-wide/CardItemWide";

export default function Categories() {
  const router = useRouter();
  const { data: categories, isLoading } = api.category.getAll.useQuery();

  if (isLoading) return <Spinner background />;

  return (
    <YStack className="flex-1 items-center justify-start px-4" space>
      <ScrollView className="grid grid-cols-2 grid-rows-2 w-screen px-4 pt-4 pb-12" space={"$2"}>
        {categories?.map((category) => (
          <CardItemWide
            key={category.id}
            onPress={() => router.push(`/categories/${category.id}`)}
            title={category.name}
            text1={`${category._count.products} products`}
            image={`${Constants.expoConfig?.extra?.CATEGORY_ICON}/${category.id}/0.jpg`}
          />
        ))}
      </ScrollView>
    </YStack>
  );
}
