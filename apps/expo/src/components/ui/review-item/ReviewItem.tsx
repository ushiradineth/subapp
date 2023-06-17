import { useRouter } from "expo-router";
import { Heart, HeartCrack, MessageSquare } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";

import { generalizeDate } from "~/utils/utils";
import { type Review, type User } from ".prisma/client";

interface Props {
  review: Review & {
    user: User;
    _count: {
      likes: number;
      dislikes: number;
      comments: number;
    };
  };
}

const ReviewItem = ({ review }: Props) => {
  const router = useRouter();

  return (
    <YStack
      onPress={() => router.push(`/product/${review.productId}/review/${review.id}`)}
      className="bg-background flex h-fit w-full items-center justify-start rounded-2xl p-2">
      <XStack className="flex w-full items-center justify-start">
        <YStack className="bg-foreground flex h-10 w-10 items-center justify-center rounded-full" />
        <YStack className="bg-background flex h-12 justify-center rounded-b-2xl p-2">
          <Text className="h-4 text-sm">{review.user.name}</Text>
          <Text className="h-4 text-xs">{generalizeDate(review.createdAt)}</Text>
        </YStack>
      </XStack>
      <Text className="flex max-h-48 w-full justify-center rounded-b-2xl p-2 text-xs">{review.review}</Text>
      <XStack className="flex w-full justify-between px-2 pt-2">
        <XStack>
          <XStack>
            <Text className="mr-1">
              <Heart color="black" />
            </Text>
            <Text>{review._count.likes}</Text>
          </XStack>
          <XStack className="ml-2">
            <Text className="mr-1">
              <HeartCrack color="black" />
            </Text>
            <Text>{review._count.dislikes}</Text>
          </XStack>
        </XStack>

        <XStack className="ml-2">
          <Text className="mr-1">
            <MessageSquare color="black" />
          </Text>
          <Text>{review._count.comments}</Text>
        </XStack>
      </XStack>
    </YStack>
  );
};

export default ReviewItem;
