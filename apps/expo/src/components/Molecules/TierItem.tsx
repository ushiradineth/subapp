import React from "react";
import { useRouter } from "expo-router";
import { Text, XStack } from "tamagui";

interface Props {
  tier: {
    id: string;
    name: string;
    price: number;
    period: number;
    productId: string;
  };
}

const TierItem = ({ tier }: Props) => {
  const router = useRouter();

  let period = "";
  switch (tier.period) {
    case 1:
      period = "per day";
      break;
    case 7:
      period = "per week";
      break;
    case 28:
      period = "per month";
      break;
    case 365:
      period = "per year";
      break;
    default:
      throw new Error("Invalid tier period");
  }

  return (
    <XStack
      onPress={() => tier.productId && router.push(`/product/${tier.productId}/tier/${tier.id}`)}
      className="bg-background flex h-16 w-full items-center justify-between rounded-2xl p-4">
      <Text className="text-xl font-semibold">{tier.name}</Text>
      <Text className="text-[11px] font-semibold">{`$${tier.price} ${period}`}</Text>
    </XStack>
  );
};

export default TierItem;
