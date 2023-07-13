import React, { useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
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
    <ScrollView contentInsetAdjustmentBehavior="automatic" backgroundColor={"$background"}>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            autoCapitalize: "none",
            autoFocus: true,
            hideWhenScrolling: false,
            onChangeText: (value) => {
              setQueried(false);
              setSearch(value.nativeEvent.text);
            },
            textColor: "black",
            onCancelButtonPress: () => router.back()
          },
        }}
      />
      <YStack space className="flex items-center justify-center p-4">
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
              title={trimString(product.name, 16)}
              text1={trimString(product.vendor.name, 16)}
              text2={trimString(product.category.name, 16)}
              image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}/0.jpg`}
            />
          ))
        )}
      </YStack>
    </ScrollView>
  );
}
