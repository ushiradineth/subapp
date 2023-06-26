import { useEffect } from "react";
import StarRating from "react-native-star-rating-widget";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useRouter, useSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, Label, Text, TextArea, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { ReviewSchema, type ReviewFormData } from "~/utils/validators";
import { Spinner } from "~/components/Spinner";
import { type Review } from ".prisma/client";

export default function Review() {
  const router = useRouter();
  const { reviewId, productId } = useSearchParams();

  if (!productId || typeof productId !== "string") throw new Error("Product id not found");

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

  const { data: review, isLoading } = api.review.getById.useQuery(
    { id: typeof reviewId !== "undefined" ? (reviewId as string) : "" },
    {
      onSuccess: (data) => {
        setValue("Rating", data?.rating ?? 0);
        setValue("Review", data?.review ?? "");
      },
      enabled: Boolean(reviewId),
    },
  );

  const { mutate: createReview, isLoading: isCreating } = api.review.create.useMutation({
    onSettled: () => router.back(),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Review has been created" });
    },
    onError: (err) => {
      Toast.show({ type: "error", text1: "Failed creating the review" });
    },
  });
  const { mutate: updateReview, isLoading: isUpdating } = api.review.update.useMutation({
    onSettled: () => router.back(),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Review has been updated" });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed updating the review" }),
  });
  const { mutate: deleteReview, isLoading: isDeleting } = api.review.delete.useMutation({
    onSettled: () => router.back(),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Review has been deleted" });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed deleting the review" }),
  });

  const onCreate = (data: ReviewFormData) => createReview({ productId: productId, rating: data.Rating, review: data.Review });
  const onUpdate = (data: ReviewFormData) =>
    updateReview({ reviewId: typeof reviewId !== "undefined" ? (reviewId as string) : "", rating: data.Rating, review: data.Review });

  useEffect(() => {
    clearErrors();
  }, []);

  if (Boolean(reviewId) && isLoading) {
    return <Spinner background />;
  }

  return (
    <YStack className="h-full p-4" space backgroundColor={"$background"}>
      <StatusBar style="light" />
      <YStack>
        <Text className="text-2xl font-bold">Share your experience</Text>
      </YStack>

      <YStack space="$4">
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
                {errors.Rating && <Text color={"red"}>{errors.Rating.message}</Text>}
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
                  defaultValue={review?.review ?? ""}
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
                {errors.Review && <Text color={"red"}>{errors.Review.message}</Text>}
              </YStack>
            </YStack>
          )}
          name="Review"
        />

        <XStack alignSelf="flex-end">
          {review ? (
            <XStack space={"$2"}>
              <Button onPress={() => deleteReview({ id: typeof reviewId !== "undefined" ? (reviewId as string) : "" })} theme="red_alt2">
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
    </YStack>
  );
}
