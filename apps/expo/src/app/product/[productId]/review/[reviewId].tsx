import { Pressable, View } from "react-native";
import { useSearchParams } from "expo-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Input, ScrollView, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { CommentSchema, type CommentFormData } from "~/utils/validators";
import { Spinner } from "~/components/Spinner";
import CommentItem from "~/components/ui/comment-item/CommentItem";
import ReviewItem from "~/components/ui/review-item/ReviewItem";

const Review: React.FC = () => {
  const { reviewId } = useSearchParams();
  if (!reviewId || typeof reviewId !== "string") throw new Error("Review id not found");

  const { control, handleSubmit, setValue, watch } = useForm<CommentFormData>({
    resolver: yupResolver(CommentSchema),
  });

  const { data: review, refetch } = api.review.getById.useQuery({ id: reviewId });
  const { mutate } = api.comment.create.useMutation({
    onSuccess: (data) => {
      review?.comments.unshift(data);
      setValue("Comment", "");
    },
  });

  const onSubmit = (data: CommentFormData) => mutate({ reviewId, comment: data.Comment });

  if (!review) return <Spinner background />;

  return (
    <View className="flex-1">
      <ScrollView className="mb-10" backgroundColor="$background">
        <YStack space className="p-4">
          <ReviewItem review={review} />
          <Text className="text-xs font-semibold">Comments ({review?.comments.length})</Text>
          {review?.comments?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onDelete={refetch} />
          ))}
          {review?.comments.length === 0 && <Text>No comments yet</Text>}
        </YStack>
      </ScrollView>
      <View className="absolute bottom-0 right-0 w-screen p-4">
        <XStack className="bg-background flex w-full rounded-3xl border-2 border-white">
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                flex={1}
                size={"$2"}
                className="bg-background border-background ml-2 mt-[2px] placeholder:text-xs placeholder:font-semibold"
                onBlur={onBlur}
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                placeholder={"Add a Comment"}
                onChange={onChange}
              />
            )}
            name="Comment"
          />

          <Pressable onPress={handleSubmit(onSubmit)}>
            <Text
              className={`ml-auto p-2 text-xs font-semibold ${
                ((watch("Comment") ?? "").length ?? 0) > 500 ? "text-foreground" : "text-accent"
              }`}>
              Post
            </Text>
          </Pressable>
        </XStack>
      </View>
    </View>
  );
};

export default Review;
