import React, { useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Input, ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import CardItemWide from "~/components/Atoms/CardItemWide";
import { Spinner } from "~/components/Atoms/Spinner";
import useDebounce from "~/hooks/useDebounce";

export default function Search() {
  const [search, setSearch] = useState("");
  const [queried, setQueried] = useState(false);
  const { mutate, data, isLoading } = api.product.search.useMutation({
    onMutate: () => setQueried(true),
    onError: () => Toast.show({ type: "error", text1: "Failed to search for products" }),
  });
  const router = useRouter();

  useDebounce(() => search !== "" && !queried && mutate({ keys: search }), 800);

  return (
    <ScrollView backgroundColor={"$background"}>
      <YStack space className="flex items-center justify-center p-4">
        <YStack className="w-full">
          <Input
            placeholder="Search for products"
            autoCapitalize={"none"}
            onChangeText={(value) => {
              setQueried(false);
              setSearch(value);
            }}
            value={search}
          />
        </YStack>
        {search === "" ? (
          <Text className="text-lg font-semibold text-gray-500">Search for products or categories</Text>
        ) : isLoading ? (
          <Spinner />
        ) : !data || data.length === 0 ? (
          <Text className="text-lg font-semibold text-gray-500">No product found</Text>
        ) : (
          data?.map((product) => (
            <CardItemWide
              key={product.id}
              onPress={() => {
                router.back();
                router.push(`product/${product.id}`);
              }}
              title={product.name}
              text1={product.vendor.name}
              text2={product.category.name}
              image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}/0.jpg`}
            />
          ))
        )}
      </YStack>
    </ScrollView>
  );
}
