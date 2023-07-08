import React from "react";
import { useSearchParams } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";
import ReviewItem from "~/components/Molecules/ReviewItem";

const Reviews = () => {
  const { productId } = useSearchParams();
  if (!productId || typeof productId !== "string") throw new Error("Product id not found");

  const { data: reviews, isLoading } = api.review.getByProductId.useQuery({ id: productId });

  if (isLoading) return <Spinner background />;
  if (reviews?.length === 0) return <NoData>No reviews found</NoData>;

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
