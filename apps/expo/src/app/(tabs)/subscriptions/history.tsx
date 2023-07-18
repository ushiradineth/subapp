import React from "react";
import { RefreshControl } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { generalizeDate, trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

export default function History() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = api.user.subscriptions.useQuery({ showTerminatedSubscripitions: true });

  if (isLoading) return <Spinner background />;
  if (!data || data?.subscriptions?.length === 0) return <NoData background>No subscriptions found</NoData>;

  return (
    <ScrollView
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <YStack space className="p-4">
        {data?.subscriptions?.map((subscription) => (
          <CardItemWide
            key={subscription.id}
            onPress={() => router.replace(`subscriptions/${subscription.id}`)}
            title={trimString(subscription.product?.name ?? subscription.template?.name ?? "", 16)}
            text1={trimString(subscription.tier?.name ?? "", 16)}
            text2={trimString(`Canceled ${generalizeDate(subscription.deletedAt)}`, 24)}
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${subscription.productId}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
