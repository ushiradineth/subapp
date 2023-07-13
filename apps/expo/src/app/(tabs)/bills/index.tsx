import React, { useContext } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { PERIODS, generalizeDate, trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import { Spinner } from "~/components/Atoms/Spinner";
import { AuthContext } from "~/app/_layout";

export default function Bills() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { data: user, isLoading } = api.user.profile.useQuery();

  if (!isLoading && !user) {
    Toast.show({ type: "error", text1: "Not logged in" });
    auth.logout();
  }

  return (
    <ScrollView backgroundColor="$background">
      <YStack space className="p-4">
        <YStack className="bg-background flex h-28 w-full items-center justify-center rounded-3xl p-4" space={"$1"}>
          {user ? (
            <>
              <Text className="text-center text-lg font-bold">Current Monthly Bill</Text>
              <Text className="text-accent text-center text-lg font-bold">${user.cost?.toFixed(2)}</Text>
              <Text className="text-foreground text-center text-sm font-bold">{user.count} Subscriptions</Text>
            </>
          ) : (
            <Spinner />
          )}
        </YStack>
        <ScrollView backgroundColor="$background">
          <YStack space>
            {user?.subscriptions?.map((subscription) => (
              <CardItemWide
                key={subscription.id}
                onPress={() => router.push(`lists/subscriptions/${subscription.id}`)}
                title={trimString(subscription.product?.name ?? subscription.template?.name ?? "", 16)}
                text1={trimString(subscription.tier?.name ?? "", 16)}
                text2={trimString(`Subscribed ${generalizeDate(subscription.startedAt)}`, 24)}
                text3={
                  <Text className="text-accent mt-1 font-semibold">{`$${subscription?.tier.price} per ${
                    PERIODS.find((p) => p.period == subscription?.tier.period)?.label
                  }`}</Text>
                }
                image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${subscription.productId}/0.jpg`}
              />
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </ScrollView>
  );
}
