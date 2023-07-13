import React from "react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { generalizeDate, trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

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
  if (!data || data?.subscriptions?.length === 0) return <NoData background>No subscriptions found</NoData>;

  return (
    <ScrollView backgroundColor={"$background"}>
      <YStack space className="p-4">
        {data?.subscriptions?.map((subscription) => (
          <CardItemWide
            key={subscription.id}
            onPress={() => router.push(`lists/subscriptions/${subscription.id}`)}
            title={trimString(subscription.product?.name ?? subscription.template?.name ?? "", 20)}
            text1={trimString(subscription.tier?.name ?? "", 20)}
            text2={trimString(`${generalizeDate(subscription.createdAt)}`, 20)}
            text3={
              <Text className="text-accent font-semibold">
                {trimString(`$${subscription.tier.price} per ${PERIODS.find((p) => p.period == subscription.tier.period)?.label}`, 20)}
              </Text>
            }
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${subscription.productId}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
