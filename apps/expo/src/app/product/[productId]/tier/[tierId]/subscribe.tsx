import { useState } from "react";
import { Platform } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

const Subscribe: React.FC = () => {
  const { tierId } = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);
  if (!tierId || typeof tierId !== "string") throw new Error("Tier id not found");

  const { data: tier, isLoading } = api.tier.getById.useQuery({ id: tierId });
  const [startedAt, setStartedAt] = useState(new Date());
  const { mutate, isLoading: isCreating } = api.subscription.create.useMutation({
    onSuccess: () => {
      router.push(`/product/${tier?.productId}`);
      Toast.show({ type: "success", text1: "Your subscription was successful" });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed to subscribe" }),
  });

  const onChange = (event: unknown, selectedDate: Date | undefined) => {
    setShow(false);
    setStartedAt(selectedDate ?? new Date());
  };

  if (isLoading) return <Spinner background />;
  if (!tier) return <NoData background>No tier found</NoData>;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <Stack.Screen
        options={{
          headerTitle: trimString(tier.product?.name ?? "", 18),
        }}
      />
      <YStack className="p-4" space="$4">
        <XStack space className="flex w-full items-center">
          <Text className="mr-auto text-sm">Pick Starting Date</Text>
          {Platform.OS === "android" && (
            <Button icon={<Calendar />} onPress={() => setShow(true)}>
              {startedAt.toLocaleDateString("en-GB") ?? "Select Date"}
            </Button>
          )}
          {(Platform.OS === "ios" || show) && (
            <DateTimePicker testID="dateTimePicker" value={startedAt} mode={"date"} display={"calendar"} onChange={onChange} />
          )}
        </XStack>
        <Button onPress={() => mutate({ tierId: tierId, productId: tier.productId ?? "", startedAt })} theme="alt2">
          {isCreating ? <Spinner /> : "Subscribe"}
        </Button>
      </YStack>
      {Platform.OS === "ios" && <StatusBar style="light" />}
    </ScrollView>
  );
};

export default Subscribe;
