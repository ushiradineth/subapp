import { useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Heart, HeartCrack, MessageSquare, Star } from "lucide-react-native";
import { Image, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { generalizeDate } from "~/utils/utils";
import { AuthContext } from "~/app/_layout";
import { type Review, type User } from ".prisma/client";

interface Props {
  review: Review & {
    user: User;
    likes: User[];
    dislikes: User[];
    _count: {
      likes: number;
      dislikes: number;
      comments: number;
    };
  };
  clampText?: boolean;
}

const ReviewItem = ({ review, clampText }: Props) => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const [like, setLike] = useState(review.likes.length > 0);
  const [dislike, setDislike] = useState(review.dislikes.length > 0);
  const [clamp, setClamp] = useState(clampText);

  const { mutate: mutateLike } = api.review.like.useMutation({
    onMutate: (variables) => {
      setLike(() => {
        variables.active ? review._count.likes++ : review._count.likes--;
        return variables.active;
      });
    },
    onError: (error, variables) => {
      setLike(() => {
        variables.active ? review._count.likes-- : review._count.likes++;
        return !variables.active;
      });
    },
  });

  const { mutate: mutateDislike } = api.review.like.useMutation({
    onMutate: (variables) => {
      setDislike(() => {
        variables.active ? review._count.dislikes++ : review._count.dislikes--;
        return variables.active;
      });
    },
    onError: (error, variables) => {
      setDislike(() => {
        variables.active ? review._count.dislikes-- : review._count.dislikes++;
        return !variables.active;
      });
    },
  });

  useEffect(() => {
    setLike(review.likes.length > 0);
    setDislike(review.dislikes.length > 0);
  }, [review]);

  const handleLike = () => {
    if (dislike) {
      mutateDislike({ reviewId: review.id, active: false, userId: auth.session.id });
    }

    mutateLike({ reviewId: review.id, active: !like, userId: auth.session.id });
  };

  const handleDislike = () => {
    if (like) {
      mutateLike({ reviewId: review.id, active: false, userId: auth.session.id });
    }

    mutateDislike({ reviewId: review.id, active: !dislike, userId: auth.session.id });
  };
  return (
    <YStack
      onPress={() => router.push(`/product/${review.productId}/review/${review.id}`)}
      className="bg-background flex h-fit w-full items-center justify-start rounded-2xl p-3">
      <XStack className="flex w-full items-center justify-between">
        <XStack className="flex items-center">
          <Image
            className="bg-foreground flex h-10 w-10 items-center justify-center rounded-full"
            source={{
              uri: `${Constants.expoConfig?.extra?.USER_ICON}/${review.user.id}/0.jpg`,
              width: 40,
              height: 40,
            }}
            alt={review.user.id}
          />
          <YStack className="bg-background flex h-12 justify-center rounded-b-2xl p-2">
            <Text className="h-4 text-sm">{review.user.name}</Text>
            <Text className="h-4 text-xs">{generalizeDate(review.createdAt)}</Text>
          </YStack>
        </XStack>
        <XStack className="bg-foreground/20 flex items-center justify-center rounded-2xl p-2" space={"$1"}>
          <Star color="transparent" fill="gold" />
          <Text className="font-semibold">{review.rating.toFixed(1)}</Text>
        </XStack>
      </XStack>
      <Text className={"flex w-full justify-center truncate rounded-b-2xl py-2 text-xs"}>
        {clamp && (review.review?.length || 0) > 200 ? `${review.review?.slice(0, 200)}...` : review.review}
      </Text>
      {(review.review?.length || 0) > 200 && clampText && (
        <Pressable onPress={() => setClamp((prev) => !prev)}>
          <Text className="text-accent mt-1 text-[10px] font-bold">{clamp ? "SHOW MORE" : "SHOW LESS"}</Text>
        </Pressable>
      )}
      <XStack className="flex w-full justify-between pr-2 pt-2">
        <XStack>
          <XStack>
            <Text className="mr-1">
              <Pressable onPress={handleLike}>
                <Heart color="black" fill={like ? theme.colors.accent : "none"} />
              </Pressable>
            </Text>
            <Text>{review._count.likes}</Text>
          </XStack>
          <XStack className="ml-2">
            <Text className="mr-1">
              <Pressable onPress={handleDislike}>
                <HeartCrack color="black" fill={dislike ? theme.colors.accent : "none"} />
              </Pressable>
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
