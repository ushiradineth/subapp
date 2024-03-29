import { useMemo, useState } from "react";
import { Pressable } from "react-native";
import { Link, Stack, usePathname, useRouter, useSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { PERIODS, trimString } from "~/utils/utils";
import BackButton from "~/components/Atoms/BackButton";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

const Tier: React.FC = () => {
  const [clamp, setClamp] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const { tierId } = useSearchParams();
  if (!tierId || typeof tierId !== "string") throw new Error("Tier id not found");

  const { data: tier, isLoading } = api.tier.getById.useQuery({ id: tierId });

  const memoizedValues = useMemo(() => {
    return {
      backbutton: <BackButton />,
      subscribe: (
        <Pressable onPress={() => router.push(pathname + "/subscribe")} android_ripple={{ color: "gray", radius: 20, borderless: true }}>
          <Plus color="black" />
        </Pressable>
      ),
    };
  }, [pathname, router]);

  if (isLoading) return <Spinner background />;
  if (!tier) return <NoData background>No tier found</NoData>;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <Stack.Screen
        options={{
          headerTitle: trimString(tier.product?.name ?? "", 18),
          headerLeft: () => memoizedValues.backbutton,
          headerRight: () => memoizedValues.subscribe,
        }}
      />
      <YStack space className="p-4">
        <XStack space className="flex items-center">
          <Text className="text-2xl font-bold">{tier.name}</Text>
          <Text className="text-accent ml-auto text-xs font-bold">
            ${tier.price} per {PERIODS.find((p) => p.period === tier.period)?.label}
          </Text>
        </XStack>
        <YStack>
          <Text className={"overflow-scroll truncate whitespace-normal text-[16px] font-medium"}>
            {clamp && (tier.description?.length || 0) > 200 ? `${tier.description?.slice(0, 200)}...` : tier.description}
          </Text>
          {(tier.description?.length || 0) > 200 && (
            <Pressable className="flex w-full items-center justify-center" onPress={() => setClamp((prev) => !prev)}>
              <Text className="text-accent mt-1 text-[10px] font-bold">{clamp ? "SHOW MORE" : "SHOW LESS"}</Text>
            </Pressable>
          )}
        </YStack>

        <YStack>
          {tier.points.map((point, index) => (
            <XStack key={index}>
              <Text>{"- "}</Text>
              <Text className={"text-[16px] font-medium"}>{point}</Text>
            </XStack>
          ))}
        </YStack>

        <Link href={tier.product?.link ?? ""} className="text-accent ml-auto w-full text-center text-xs font-bold">
          Go to the Official Website
        </Link>
      </YStack>
    </ScrollView>
  );
};

export default Tier;
