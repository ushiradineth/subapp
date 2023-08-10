import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
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

  const onSearch = useCallback((value: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setQueried(false);
    setSearch(value.nativeEvent.text);
  }, []);

  const content = useMemo(() => {
    if (isLoading) return <Spinner />;

    if (search === "") return <NoData>Search for products or categories</NoData>;

    if (data?.length === 0 && queried) return <NoData background>No products found</NoData>;

    return data?.map((product) => (
      <CardItemWide
        key={product.id}
        onPress={() => {
          router.back();
          router.push(`product/${product.id}`);
        }}
        title={trimString(product.name, 16)}
        text1={trimString(product.vendor.name, 16)}
        text2={trimString(product.category.name, 16)}
        text3={product.subscriptions.length > 0 && "Subscribed"}
        image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}.jpg`}
      />
    ));
  }, [data, isLoading, queried, router, search]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => mutate({ keys: search })} />}>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            autoCapitalize: "none",
            autoFocus: true,
            hideWhenScrolling: false,
            onChangeText: (value) => onSearch(value),
            onSearchButtonPress: (value) => onSearch(value),
            textColor: "black",
            onCancelButtonPress: () => router.back(),
          },
        }}
      />
      <YStack space className="flex items-center justify-center p-4">
        {content}
      </YStack>
    </ScrollView>
  );
}
