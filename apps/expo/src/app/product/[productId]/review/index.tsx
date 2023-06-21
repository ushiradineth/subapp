import React from "react";
import { useSearchParams } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { Spinner } from "~/components/Spinner";
import ReviewItem from "~/components/ui/review-item/ReviewItem";

const Reviews = () => {
  const { productId } = useSearchParams();
  if (!productId || typeof productId !== "string") throw new Error("Product id not found");

  const { data: reviews, isLoading } = api.review.getByProductId.useQuery({ id: productId });

  if (isLoading) return <Spinner background />;

  return (
    <ScrollView className="h-fit" backgroundColor="$background">
      <YStack space className="p-4">
        {reviews?.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </YStack>
    </ScrollView>
  );
};

export default Reviews;
