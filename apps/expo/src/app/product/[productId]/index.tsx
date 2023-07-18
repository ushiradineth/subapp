import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { Link, Stack, usePathname, useRouter, useSearchParams } from "expo-router";
import { ExternalLink } from "lucide-react-native";
import { Button, H2, Image, ScrollView, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { trimString } from "~/utils/utils";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";
import ReviewItem from "~/components/Molecules/ReviewItem";

const Product: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { productId } = useSearchParams();
  const [clamp, setClamp] = useState(true);

  if (!productId || typeof productId !== "string") throw new Error("Product id not found");
  const { data, isLoading, refetch, isRefetching } = api.product.getProductPage.useQuery(
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
      !wishlisted
        ? Toast.show({ type: "success", text1: "Added to wishlist" })
        : Toast.show({ type: "success", text1: "Removed from wishlist" });
    },
    onError() {
      !wishlisted
        ? Toast.show({ type: "error", text1: "Failed to add to wishlist" })
        : Toast.show({ type: "error", text1: "Failed to remove from wishlist" });
    },
  });

  const memoizedCTAs = useMemo(() => {
    if (data?.subscribed) {
      return (
        <View className="bg-accent border-accent flex h-full w-full items-center justify-center rounded-3xl border">
          <Text className="text-[16px] font-bold text-white">Subscribed</Text>
        </View>
      );
    } else {
      const wishlistContent = wishlisted ? "Wishlisted" : "Add to Wishlist";

      return (
        <>
          <Button
            disabled={isRefetching}
            onPress={() => router.push(`${pathname}/tier`)}
            className="bg-accent border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
            <Text className="text-[16px] font-bold text-white">Subscribe</Text>
          </Button>
          <Button
            disabled={isRefetching}
            onPress={() => wishlist({ id: productId, wishlist: !wishlisted })}
            className="bg-background border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
            <Text className="text-accent text-[16px] font-bold">{wishlisting ? <Spinner /> : wishlistContent}</Text>
          </Button>
        </>
      );
    }
  }, [data?.subscribed, isRefetching, pathname, productId, router, wishlist, wishlisted, wishlisting]);

  useEffect(() => {
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (isLoading) return <Spinner background />;
  if (!data) return <NoData background>No product found</NoData>;

  return (
    <ScrollView
      className="h-fit"
      backgroundColor="$background"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
      <Stack.Screen
        options={{
          headerTitle: trimString(data?.product?.name ?? "", 18),
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
            className="bg-foreground h-36 w-36 rounded-3xl"
          />
          <YStack className="ml-4">
            <H2 className="text-2xl font-bold">{trimString(data?.product?.name ?? "", 10)}</H2>
            <Link href={`/categories/${data.product.category.id}`}>
              <Text>{trimString(data?.product?.category.name ?? "", 18)}</Text>
            </Link>
            <Link className="mt-2" href={data?.product?.link ?? ""}>
              <XStack className="text-accent flex items-center text-xs font-bold">
                <ExternalLink size={20} color={theme.colors.accent} />
                <Text className="text-accent mt-1 text-xs font-bold"> Official Website</Text>
              </XStack>
            </Link>
          </YStack>
        </XStack>

        <XStack className="flex h-16 items-center justify-between">{memoizedCTAs}</XStack>

        <InfoCard>
          <Rating rating={data?.review?.[0]?.rating} caption={`from ${data?.product?._count.reviews ?? 0} users`} />
          <Divider />
          <Rating rating={data?.review?.[0]?.rating} caption={"Your rating"} />
        </InfoCard>

        <InfoCard>
          <Stat caption="Popularity" value={`#${data?.rank}`} />
          <Divider />
          <Stat caption="Users on SubM" value={data?.product?._count.subscriptions} />
        </InfoCard>

        <XStack className="flex flex-col items-center justify-between">
          <Text className={"overflow-scroll truncate whitespace-normal text-center text-[16px] font-medium"}>
            {clamp && (data?.product?.description.length ?? 0) > 200
              ? `${data?.product?.description?.slice(0, 200)}...`
              : data?.product?.description}
          </Text>
          {(data?.product?.description.length ?? 0) > 200 && (
            <Pressable onPress={() => setClamp((prev) => !prev)}>
              <Text className="text-accent mt-1 text-[10px] font-bold">{clamp ? "SHOW MORE" : "SHOW LESS"}</Text>
            </Pressable>
          )}
        </XStack>
      </YStack>

      <ImageSlider images={data?.images} />

      <YStack space className="p-4">
        {data?.subscribed && (
          <Button
            disabled={isRefetching}
            onPress={() => {
              router.push(
                `${pathname}/review-product?productId=${data?.product?.id}${
                  data.review && (data?.review?.length || 0) > 0 ? `&reviewId=${data?.review[0]?.id}` : ""
                }`,
              );
            }}
            className="bg-background border-accent flex h-10 w-full items-center justify-center rounded-3xl border">
            <Text className="text-accent text-[16px] font-bold">{(data?.review?.length ?? 0) > 0 ? "Edit review" : "Add review"}</Text>
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
        {data?.product?.reviews[0] ? <ReviewItem review={data?.product?.reviews[0]} clampText /> : <Text>No reviews yet</Text>}
      </YStack>
    </ScrollView>
  );
};

export default Product;

const Rating = ({ rating = 0, caption }: { rating: number | undefined; caption: string }) => {
  return (
    <XStack className="flex w-[50%] items-center justify-center">
      <YStack className="bg-foreground rounded-xl p-2">
        <Text className="font-bold text-white">{Number.isNaN(rating) ? Number(0).toFixed(1) : rating.toFixed(1)}</Text>
      </YStack>
      <YStack className="ml-2 flex items-center justify-center">
        <XStack>
          <StarRating
            onChange={() => undefined}
            starStyle={{ marginLeft: 0, marginRight: 0 }}
            starSize={20}
            enableHalfStar
            color={theme.colors.accent}
            rating={rating}
          />
        </XStack>
        <Text className="text-[10px] font-medium">{caption}</Text>
      </YStack>
    </XStack>
  );
};

const Stat = ({ value, caption }: { value: string | number; caption: string }) => {
  return (
    <YStack className="flex w-[50%] items-center justify-center">
      <Text className="text-[12px] font-semibold">{value}</Text>
      <Text className="text-[10px] font-medium">{caption}</Text>
    </YStack>
  );
};

const InfoCard = ({ children }: { children: ReactNode }) => {
  return <XStack className="bg-background flex h-16 items-center justify-between rounded-3xl">{children}</XStack>;
};

const Divider = () => <YStack className="bg-foreground h-[80%] w-[2px] rounded-full" />;

const ImageSlider = ({ images }: { images: { url: string }[] }) => {
  return (
    <ScrollView className="px-4 pl-4" horizontal space>
      <XStack className="border-foreground mr-8 rounded-3xl border p-4" space="$2">
        {images.map((image, index) => (
          <YStack key={index} className="h-[144px] w-[144px]">
            <Image
              key={index}
              source={{ uri: image.url, width: 144, height: 144 }}
              alt={image.url}
              resizeMode="cover"
              className={`bg-foreground rounded-lg ${index !== images.length - 1 && "mr-4"}`}
            />
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  );
};
