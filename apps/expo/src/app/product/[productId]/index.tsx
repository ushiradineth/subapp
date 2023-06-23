import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { Stack, usePathname, useRouter, useSearchParams } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Star } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Adapt, Button, Dialog, H2, Image, Label, ScrollView, Sheet, Text as TamaguiText, TextArea, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { ReviewSchema, type ReviewFormData } from "~/utils/validators";
import BackButton from "~/components/BackButton";
import { Spinner } from "~/components/Spinner";
import ReviewItem from "~/components/ui/review-item/ReviewItem";
import { type Review as ReviewType } from ".prisma/client";

const Product: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { productId } = useSearchParams();
  const [clamp, setClamp] = useState(true);

  if (!productId || typeof productId !== "string") throw new Error("Product id not found");
  const { data, isLoading, refetch } = api.product.getProductPage.useQuery(
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
  });
  const [open, setOpen] = useState(false);

  if (isLoading) return <Spinner background />;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <Review open={open} setOpen={setOpen} productId={productId} existingReview={data?.review?.[0] ?? null} onSuccess={refetch} />
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
        <XStack className="flex h-16 items-center justify-between">
          {data?.subscribed ? (
            <Button className="bg-background border-accent flex h-full w-full items-center justify-center rounded-3xl border">
              <Text className="text-accent text-[16px] font-bold">Subscribed</Text>
            </Button>
          ) : (
            <>
              <Button
                onPress={() => router.push(`${pathname}/tier`)}
                className="bg-background border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
                <Text className="text-accent text-[16px] font-bold">Subscribe</Text>
              </Button>
              <Button
                onPress={() => wishlist({ id: productId, wishlist: !wishlisted })}
                className="bg-background border-accent flex h-full w-[49%] items-center justify-center rounded-3xl border">
                <Text className="text-accent text-[16px] font-bold">
                  {wishlisting ? <Spinner /> : wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Text>
              </Button>
            </>
          )}
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
        <XStack className="flex flex-col items-center justify-between">
          <Text className={"overflow-scroll truncate whitespace-normal text-center text-[16px] font-medium"}>
            {clamp && (data?.product?.description.length || 0) > 200
              ? `${data?.product?.description?.slice(0, 200)}...`
              : data?.product?.description}
          </Text>
          {(data?.product?.description.length || 0) > 200 && (
            <Pressable onPress={() => setClamp((prev) => !prev)}>
              <Text className="text-accent mt-1 text-[10px] font-bold">{clamp ? "SHOW MORE" : "SHOW LESS"}</Text>
            </Pressable>
          )}
        </XStack>
      </YStack>

      <ScrollView className="px-4 pl-4" horizontal space>
        <XStack className="border-foreground mr-8 rounded-3xl border p-4" space="$2">
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
        {!data?.subscribed && (
          <Button
            onPress={() => setOpen(true)}
            className="bg-background border-accent flex h-10 w-full items-center justify-center rounded-3xl border">
            <Text className="text-accent text-[16px] font-bold">{data?.review?.length || 0 > 0 ? "Edit review" : "Add review"}</Text>
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

function Rating({ rating = 0, caption }: { rating: number | undefined; caption: string }) {
  return (
    <>
      <YStack className="bg-foreground rounded-xl p-2">
        <Text className="font-bold text-white">{Number.isNaN(rating) ? Number(0).toFixed(1) : rating.toFixed(1)}</Text>
      </YStack>
      <YStack className="ml-2 flex items-center justify-center">
        <XStack>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill={i < rating ? theme.colors.accent : "gray"} color={i < rating ? theme.colors.accent : "gray"} />
          ))}
        </XStack>
        <Text className="text-[10px] font-medium">{caption}</Text>
      </YStack>
    </>
  );
}

function Review({
  open,
  setOpen,
  productId,
  existingReview,
  onSuccess,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  productId: string;
  existingReview: ReviewType | null;
  onSuccess: () => void;
}) {
  const { mutate: createReview, isLoading: isCreating } = api.review.create.useMutation({
    onSettled: () => setOpen(false),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Review has been created" });
      onSuccess();
    },
  });
  const { mutate: updateReview, isLoading: isUpdating } = api.review.update.useMutation({
    onSettled: () => setOpen(false),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Review has been updated" });
      onSuccess();
    },
  });
  const { mutate: deleteReview, isLoading: isDeleting } = api.review.delete.useMutation({
    onSettled: () => setOpen(false),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Review has been deleted" });
      onSuccess();
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: yupResolver(ReviewSchema),
  });

  const onCreate = (data: ReviewFormData) => createReview({ productId: productId, rating: data.Rating, review: data.Review });
  const onUpdate = (data: ReviewFormData) => updateReview({ reviewId: existingReview?.id ?? "", rating: data.Rating, review: data.Review });

  useEffect(() => {
    clearErrors();
    existingReview && setValue("Rating", existingReview.rating);
  }, [open]);

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}>
      <Adapt when="sm" platform="touch">
        <Sheet zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" space>
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          space>
          <Dialog.Title>{existingReview ? "Edit Review" : "Add Review"}</Dialog.Title>
          <YStack className="p-4" space="$4">
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange } }) => (
                <YStack className="w-full">
                  <XStack>
                    <Label width={80} justifyContent="flex-end" htmlFor="rating">
                      Rating
                    </Label>
                    <StarRating starSize={24} rating={watch("Rating")} onChange={onChange} maxStars={5} enableHalfStar enableSwiping />
                  </XStack>
                  <YStack className="flex items-center justify-center">
                    {errors.Rating && <TamaguiText color={"red"}>{errors.Rating.message}</TamaguiText>}
                  </YStack>
                </YStack>
              )}
              name="Rating"
            />

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <YStack className="w-full">
                  <XStack>
                    <Label width={80} justifyContent="flex-end" htmlFor="review">
                      Review
                    </Label>
                    <TextArea
                      defaultValue={existingReview?.review ?? ""}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      flex={1}
                      maxHeight={200}
                      minHeight={100}
                      id="review"
                      placeholder="Describe your experience"
                    />
                  </XStack>
                  <YStack className="flex items-center justify-center">
                    {errors.Review && <TamaguiText color={"red"}>{errors.Review.message}</TamaguiText>}
                  </YStack>
                </YStack>
              )}
              name="Review"
            />

            <XStack alignSelf="flex-end">
              {existingReview ? (
                <XStack space={"$2"}>
                  <Button onPress={() => deleteReview({ id: existingReview.id })} theme="red_alt2">
                    {isDeleting ? <Spinner /> : "Delete"}
                  </Button>
                  <Button onPress={handleSubmit(onUpdate)} theme="alt2">
                    {isUpdating ? <Spinner /> : "Update"}
                  </Button>
                </XStack>
              ) : (
                <Button onPress={handleSubmit(onCreate)} theme="alt2">
                  {isCreating ? <Spinner /> : "Submit"}
                </Button>
              )}
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
