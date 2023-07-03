import React from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { generalizeDate } from "~/utils/utils";
import NoData from "~/components/NoData";
import { Spinner } from "~/components/Spinner";
import CardItemWide from "~/components/ui/card-item-wide/CardItemWide";

export const PERIODS = [
  { period: 1, label: "Day" },
  { period: 7, label: "Week" },
  { period: 28, label: "Month" },
  { period: 365, label: "Year" },
];

export default function Subscriptions() {
  const router = useRouter();
  const { data, isLoading } = api.user.subscriptions.useQuery({});

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
            text2={`${generalizeDate(subscription.createdAt)}`}
            text3={
              <Text className="text-accent font-semibold">{`$${subscription.tier.price} per ${
                PERIODS.find((p) => p.period == subscription.tier.period)?.label
              }`}</Text>
            }
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${subscription.productId}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
