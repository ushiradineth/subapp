import { useState } from "react";
import { Pressable, Text } from "react-native";
import { Stack, usePathname, useRouter, useSearchParams } from "expo-router";
import { Star } from "lucide-react-native";
import { Button, H2, Image, ScrollView, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import BackButton from "~/components/BackButton";
import { Spinner } from "~/components/Spinner";
import ReviewItem from "~/components/ui/review-item/ReviewItem";

const Product: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { productId } = useSearchParams();
  const [showMore, setShowMore] = useState(false);

  if (!productId || typeof productId !== "string") throw new Error("unreachable");
  const { data, isLoading } = api.product.getProductPage.useQuery(
    { id: productId },
    {
      onSuccess(data) {
        setWishlisted(data.wishlisted);
      },
    },
  );

  const [wishlisted, setWishlisted] = useState(data?.wishlisted ?? false);
  const { mutate: wishlist, isLoading: wishlisting } = api.product.wishlist.useMutation({
    onSuccess() {
      setWishlisted((wishlisted) => !wishlisted);
    },
  });

  if (isLoading) return <Spinner background />;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <Stack.Screen
        options={{
          headerTitle: data?.product?.name,
          headerLeft: () => <BackButton />,
        }}
      />
      <YStack space className="p-4">
        <XStack className="flex items-center">
          <Image
            source={{
              width: 144,
              height: 144,
              uri: data?.logo,
            }}
            alt={data?.product?.name}
            width="100%"
            height="100%"
            className="h-36 w-36 rounded-3xl"
          />
          <YStack className="ml-4">
            <H2 className="text-2xl font-bold">{data?.product?.name}</H2>
            <Text>{data?.product?.category.name}</Text>
          </YStack>
        </XStack>
        <XStack className="bg-background flex h-16 items-center justify-between rounded-3xl">
          <YStack className="flex w-[50%] items-center justify-center">
            <Text className="text-[10px] font-semibold">#{data?.rank}</Text>
            <Text className="text-[10px] font-medium">Popularity</Text>
          </YStack>
          <YStack className="bg-foreground h-[90%] w-[2px] rounded-full" />
          <YStack className="flex w-[50%] items-center justify-center">
            <Text className="text-[10px] font-semibold">{data?.product?._count.subscriptions}</Text>
            <Text className="text-[10px] font-medium">Users on SubM</Text>
          </YStack>
        </XStack>
        <XStack className="bg-background flex h-16 items-center justify-between rounded-3xl">
          <XStack className="flex w-[50%] items-center justify-center">
            <Rating rating={data?.review?.[0]?.rating} caption={`from ${data?.product?._count.reviews ?? 0} users`} />
          </XStack>
          <YStack className="bg-foreground h-[90%] w-[2px] rounded-full" />
          <XStack className="flex w-[50%] items-center justify-center">
            <Rating rating={data?.review?.[0]?.rating} caption={"Your rating"} />
          </XStack>
        </XStack>
        <XStack className="flex h-16 items-center justify-between">
          {data?.subscribed ? (
            <Button className="bg-background border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
              <Text className="text-accent text-[16px] font-bold">Subscribed</Text>
            </Button>
          ) : (
            <Button
              onPress={() => router.push(`${pathname}/tier`)}
              className="bg-background border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
              <Text className="text-accent text-[16px] font-bold">Subscribe</Text>
            </Button>
          )}
          <Button
            onPress={() => wishlist({ id: productId, wishlist: !wishlisted })}
            className="bg-background border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
            <Text className="text-accent text-[16px] font-bold">
              {wishlisting ? <Spinner /> : wishlisted ? "Wishlisted" : "Add to Wishlist"}
            </Text>
          </Button>
        </XStack>
        <XStack className="flex flex-col items-center justify-between">
          <Text
            className={`overflow-scroll truncate whitespace-normal text-center text-[16px] font-medium ${
              showMore ? "max-h-96" : "max-h-24"
            }`}>
            {data?.product?.description}
          </Text>
          {(data?.product?.description.length || 0) > 200 && (
            <Pressable onPress={() => setShowMore((prev) => !prev)}>
              <Text className="text-accent mt-1 text-[10px] font-bold">{showMore ? "SHOW LESS" : "SHOW MORE"}</Text>
            </Pressable>
          )}
        </XStack>
      </YStack>

      <ScrollView className="px-4 pl-4" horizontal space>
        <XStack className="border-foreground rounded-3xl border p-4 mr-8" space="$2">
          {data?.images.map((image, index) => (
            <YStack key={index} className="h-[144px] w-[144px]">
              <Image
                key={index}
                source={{ uri: image.url, width: 144, height: 144 }}
                alt={image.url}
                resizeMode="cover"
                className={`bg-foreground rounded-lg ${index !== data.images.length - 1 && "mr-4"}`}
              />
            </YStack>
          ))}
        </XStack>
      </ScrollView>

      <YStack space className="p-4">
        {data?.review && (
          <Button
            onPress={() => router.push(`${pathname}/tier`)}
            className="bg-background border-accent flex h-10 w-full items-center justify-center rounded-3xl border">
            <Text className="text-accent text-[16px] font-bold">Add Review</Text>
          </Button>
        )}
        <XStack className="flex items-center justify-between">
          <Text className="text-[16px] font-medium">Reviews</Text>
          {data?.product?.reviews[0] && (
            <Pressable onPress={() => router.push(`${pathname}/review`)}>
              <Text className="text-accent font-bold">View All</Text>
            </Pressable>
          )}
        </XStack>
        {data?.product?.reviews[0] ? <ReviewItem review={data?.product?.reviews[0]} /> : <Text>No reviews yet</Text>}
      </YStack>
    </ScrollView>
  );
};

export default Product;

function Rating({ rating = 0, caption }: { rating: number | undefined; caption: string }) {
  return (
    <>
      <YStack className="bg-foreground rounded-xl p-2">
        <Text className="font-bold text-white">{Number.isNaN(rating) ? Number(0).toFixed(1) : rating.toFixed(1)}</Text>
      </YStack>
      <YStack className="ml-2 flex items-center justify-center">
        <XStack>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < rating / 2 ? theme.colors.accent : "gray"}
              color={i < rating / 2 ? theme.colors.accent : "gray"}
            />
          ))}
        </XStack>
        <Text className="text-[10px] font-medium">{caption}</Text>
      </YStack>
    </>
  );
}
