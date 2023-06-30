import React from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { generalizeDate } from "~/utils/utils";
import NoData from "~/components/NoData";
import { Spinner } from "~/components/Spinner";
import CardItemWide from "~/components/ui/card-item-wide/CardItemWide";

export default function History() {
  const router = useRouter();
  const { data, isLoading } = api.user.subscriptions.useQuery({ showTerminatedSubscripitions: true });

  if (isLoading) return <Spinner background />;
  if (data?.subscriptions?.length === 0) return <NoData>No Subscriptions found</NoData>;

  return (
    <ScrollView backgroundColor={"$background"}>
      <YStack space className="p-4">
        {data?.subscriptions?.map((subscription) => (
          <CardItemWide
            key={subscription.id}
            onPress={() => router.push(`lists/subscriptions/${subscription.id}`)}
            title={subscription.product?.name ?? subscription.template?.name}
            text1={subscription.tier?.name}
            text2={`Canceled ${generalizeDate(subscription.createdAt)}`}
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${subscription.productId}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
