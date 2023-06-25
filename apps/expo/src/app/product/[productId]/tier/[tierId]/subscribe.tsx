import { useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import BackButton from "~/components/BackButton";
import { Spinner } from "~/components/Spinner";

const Subscribe: React.FC = () => {
  const { tierId } = useSearchParams();
  const router = useRouter();
  if (!tierId || typeof tierId !== "string") throw new Error("Tier id not found");

  const { data: tier } = api.tier.getById.useQuery({ id: tierId });
  const [startedAt, setStartedAt] = useState(new Date());
  const { mutate, isLoading } = api.subscription.create.useMutation({
    onSuccess: () => {
      router.replace(`/product/${tier?.productId}`);
      Toast.show({ type: "success", text1: "Your subscription was successful" });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed to subscribe" }),
  });

  if (!tier) return <Spinner background />;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <Stack.Screen
        options={{
          headerTitle: tier.product.name,
          headerLeft: () => <BackButton />,
        }}
      />
      <YStack className="p-4" space="$4">
        <XStack space className="flex w-full items-center">
          <Text className="mr-auto text-sm">Pick Starting Date</Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={startedAt}
            mode={"date"}
            onChange={(_, date) => setStartedAt(date ?? new Date())}
          />
        </XStack>
        <Button onPress={() => mutate({ tierId: tierId, productId: tier.productId, startedAt })} theme="alt2">
          {isLoading ? <Spinner /> : "Subscribe"}
        </Button>
      </YStack>
      <StatusBar style="light" />
    </ScrollView>
  );
};

export default Subscribe;