import { useSearchParams } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { Spinner } from "~/components/Spinner";
import TierItem from "~/components/ui/tier-item/TierItem";

export default function Tiers() {
  const { productId } = useSearchParams();
  if (!productId || typeof productId !== "string") throw new Error("Product id not found");

  const { data: tiers, isLoading } = api.tier.getByProductId.useQuery({ id: productId });

  if (isLoading) return <Spinner background />;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <YStack space className="p-4">
        {tiers?.map((tier) => (
          <TierItem key={tier.id} tier={tier} />
        ))}
        {tiers?.length === 0 && <Text>No tiers yet</Text>}
      </YStack>
    </ScrollView>
  );
}
