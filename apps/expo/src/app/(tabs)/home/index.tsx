import React, { useContext } from "react";
import { RefreshControl } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { H1, ScrollView, Text, XStack, YStack } from "tamagui";

import { type Product } from "@acme/db";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import CardItem from "~/components/Atoms/CardItem";
import { Spinner } from "~/components/Atoms/Spinner";
import { AuthContext } from "~/app/_layout";

export default function Home() {
  const auth = useContext(AuthContext);
  const { data, isLoading, refetch, isRefetching } = api.product.getHomeFeed.useQuery(undefined, {
    enabled: auth.status === "authenticated",
    retry: 0,
  });

  if (!data || auth.status === "loading") return <Spinner background />;
  return (
    <ScrollView
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <YStack space>
        <H1 className="pl-4 pt-4 text-xl font-semibold">Welcome, {auth.session?.name}</H1>
        {data?.forYouProducts.length > 0 && <Slider items={data?.forYouProducts} title="Recommended for you" />}
        {data?.trendingProducts.length > 0 && <Slider items={data?.trendingProducts} title="Trending now" />}
        {data?.forYouCategories[0] && (
          <Slider items={data?.forYouCategories[0].products} title={data.forYouCategories[0].products[0]?.category.name ?? ""} />
        )}
        {data?.productSuggestion[0] && data.productSuggestion[0].products.length > 0 && (
          <Slider
            items={data?.productSuggestion[0]?.products}
            title={`Because you are subscribed to ${data?.productSuggestion[0]?.name}`}
          />
        )}
        {data?.mostPopularProducts.length > 0 && <Slider items={data?.mostPopularProducts} title="Top 10 products on SubM" />}
        {data?.forYouCategories[1] && (
          <Slider items={data?.forYouCategories[1].products} title={data.forYouCategories[1].products[0]?.category.name ?? ""} />
        )}
        {data?.productSuggestion[1] && data.productSuggestion[1].products.length > 0 && (
          <Slider
            items={data?.productSuggestion[1]?.products}
            title={`Because you are subscribed to ${data?.productSuggestion[1]?.name}`}
          />
        )}
        {data?.newProducts.length > 0 && <Slider items={data?.newProducts} title="New products" />}
        {data?.forYouCategories
          ?.slice(2)
          .map(
            (category, index) =>
              typeof data?.forYouCategories[index] !== "undefined" && (
                <Slider key={index} items={category.products} title={category.products[0]?.category.name ?? ""} />
              ),
          )}
      </YStack>
    </ScrollView>
  );
}

interface Items extends Product {
  category: {
    name: string;
  };
}

const Slider = ({ items, title }: { items: Items[]; title: string }) => {
  const router = useRouter();
  return (
    <YStack space={"$2"}>
      <Text className="pl-4 font-semibold">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack className="mx-4" space={"$2"}>
          {items?.map((product) => (
            <CardItem
              key={product.id}
              onPress={() => router.push(`product/${product.id}`)}
              title={trimString(product.name, 14)}
              text1={trimString(product.category.name, 18)}
              image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}.jpg`}
            />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
};
