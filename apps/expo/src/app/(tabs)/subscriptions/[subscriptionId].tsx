import React, { useMemo } from "react";
import { RefreshControl } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import moment from "moment";
import { Button, H2, Image, ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { PERIODS, generalizeDate } from "~/utils/utils";
import InfoCard from "~/components/Atoms/InfoCard";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

export default function SubscriptionPage() {
  const router = useRouter();

  const { subscriptionId } = useLocalSearchParams();

  if (!subscriptionId || typeof subscriptionId !== "string") throw new Error("Subscription id not found");

  const { data, isLoading, refetch, isRefetching } = api.subscription.getById.useQuery({ id: subscriptionId });
  const { mutate, isLoading: isUnsubscribing } = api.subscription.delete.useMutation({
    onSuccess: () => router.back(),
    onError: () => Toast.show({ type: "error", text1: "An error occurred while unsubscribing" }),
  });

  const totalCycles = useMemo(
    () =>
      moment(data?.active ? moment.now() : data?.deletedAt).diff(
        data?.startedAt,
        // @ts-expect-error The diff type is not exported by moment
        PERIODS.find((p) => p.period == data?.tier.period)?.standard ?? "days",
        false,
      ),
    [data?.active, data?.deletedAt, data?.startedAt, data?.tier.period],
  );

  const totalPaid = useMemo(() => totalCycles * (data?.tier.price ?? 0), [data?.tier.price, totalCycles]);

  const nextPayment = useMemo(
    () => generalizeDate(moment(data?.startedAt).add((totalCycles + 1) * (data?.tier.period ?? 0), "days")),
    [data?.startedAt, data?.tier.period, totalCycles],
  );

  if (isLoading) return <Spinner background />;
  if (!data) return <NoData background>No subscription found</NoData>;

  return (
    <ScrollView
      backgroundColor={"$background"}
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <YStack space className="p-4">
        <XStack className="flex items-center">
          <Image
            source={{
              width: 144,
              height: 144,
              uri: `${data?.tier.product?.name ? Constants.expoConfig?.extra?.PRODUCT_LOGO : Constants.expoConfig?.extra?.TEMPLATE_ICON}/${
                data?.productId
              }/0.jpg`,
            }}
            alt={data?.tier.product?.name}
            className="bg-foreground h-36 w-36 rounded-3xl"
          />
          <YStack className="ml-4">
            <H2 className="text-2xl font-bold">{data?.tier.product?.name ?? data?.tier.template?.name}</H2>
            {data?.tier.product?.category.name && <Text>{data?.tier.product?.category.name}</Text>}
            <Text className="text-accent mt-1 font-semibold">{`$${data?.tier.price} per ${
              PERIODS.find((p) => p.period == data?.tier.period)?.label
            }`}</Text>
            {data?.productId && (
              <Link className="mt-2" href={`product/${data?.productId}`} onPress={() => router.back()}>
                <XStack className="text-accent flex items-center text-xs font-bold">
                  <ExternalLink size={20} color={theme.colors.accent} />
                  <Text className="text-accent mt-1 text-xs font-bold"> Product</Text>
                </XStack>
              </Link>
            )}
          </YStack>
        </XStack>
        {data?.active && (
          <Button
            disabled={isRefetching}
            onPress={() => mutate({ id: subscriptionId })}
            className={`flex h-16 w-full items-center rounded-3xl bg-red-500`}>
            <Text className="text-[16px] font-semibold text-white">{isUnsubscribing ? <Spinner color="white" /> : "Unsubscribe"}</Text>
          </Button>
        )}
        {data?.active ? (
          <InfoCard>
            {moment(data?.startedAt).isAfter(moment.now()) ? (
              <Text>Subscription starts {generalizeDate(data?.startedAt)}</Text>
            ) : (
              <Text>Subscribed {generalizeDate(data?.startedAt)}</Text>
            )}
          </InfoCard>
        ) : (
          <InfoCard>Canceled {generalizeDate(data?.deletedAt)}</InfoCard>
        )}
        {moment(data?.startedAt).isBefore(moment.now()) && (
          <InfoCard>
            ${totalPaid} total paid {data?.active && "since subscribed"}
          </InfoCard>
        )}
        {data?.active && <InfoCard>Next payment is {nextPayment}</InfoCard>}
      </YStack>
    </ScrollView>
  );
}
