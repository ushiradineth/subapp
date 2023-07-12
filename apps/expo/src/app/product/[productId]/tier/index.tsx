import { useSearchParams } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";
import TierItem from "~/components/Molecules/TierItem";

export default function Tiers() {
  const { productId } = useSearchParams();
  if (!productId || typeof productId !== "string") throw new Error("Product id not found");

  const { data: tiers, isLoading } = api.tier.getByProductId.useQuery({ id: productId });

  if (isLoading) return <Spinner background />;
  if (tiers?.length === 0) return <NoData>No Tiers found</NoData>;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <YStack space className="p-4">
        {tiers?.map((tier) => (
          <TierItem
            key={tier.id}
            tier={{
              id: tier.id,
              name: tier.name,
              period: tier.period,
              price: tier.price,
              productId,
            }}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
