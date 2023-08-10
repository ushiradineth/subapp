import { useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Constants from "expo-constants";
import { Heart, HeartCrack, Trash } from "lucide-react-native";
import { Image, Text, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { generalizeDate } from "~/utils/utils";
import { AuthContext } from "~/app/_layout";
import { type Comment, type User } from ".prisma/client";

interface Props {
  comment: Comment & {
    user: User;
    likes: User[];
    dislikes: User[];
    _count: {
      likes: number;
      dislikes: number;
    };
  };
  onDelete: () => void;
}

const CommentItem = ({ comment, onDelete }: Props) => {
  const auth = useContext(AuthContext);
  const [like, setLike] = useState(comment.likes.length > 0);
  const [dislike, setDislike] = useState(comment.dislikes.length > 0);
  const [clamp, setClamp] = useState(true);

  const { mutate: mutateLike } = api.comment.like.useMutation({
    onMutate: (variables) => {
      setLike(() => {
        variables.active ? comment._count.likes++ : comment._count.likes--;
        return variables.active;
      });
    },
    onError: (error, variables) => {
      setLike(() => {
        variables.active ? comment._count.likes-- : comment._count.likes++;
        return !variables.active;
      });
    },
  });

  const { mutate: mutateDislike } = api.comment.like.useMutation({
    onMutate: (variables) => {
      setDislike(() => {
        variables.active ? comment._count.dislikes++ : comment._count.dislikes--;
        return variables.active;
      });
    },
    onError: (error, variables) => {
      setDislike(() => {
        variables.active ? comment._count.dislikes-- : comment._count.dislikes++;
        return !variables.active;
      });
    },
  });

  const { mutate: mutateDelete } = api.comment.delete.useMutation({
    onSuccess: () => {
      onDelete();
      Toast.show({ type: "success", text1: "Comment has been deleted" });
    },
    onError: () => Toast.show({ type: "error", text1: "Failed deleting the comment" }),
  });

  useEffect(() => {
    setLike(comment.likes.length > 0);
    setDislike(comment.dislikes.length > 0);
  }, [comment]);

  const handleLike = () => {
    if (dislike) {
      mutateDislike({ commentId: comment.id, active: false, userId: auth.session.id });
    }

    mutateLike({ commentId: comment.id, active: !like, userId: auth.session.id });
  };

  const handleDislike = () => {
    if (like) {
      mutateLike({ commentId: comment.id, active: false, userId: auth.session.id });
    }

    mutateDislike({ commentId: comment.id, active: !dislike, userId: auth.session.id });
  };

  return (
    <YStack className="bg-background flex h-fit w-full items-center justify-start rounded-2xl p-3" space={"$2"}>
      <XStack className="flex w-full items-center justify-start">
        <Image
          className="bg-foreground flex h-10 w-10 items-center justify-center rounded-full"
          source={{
            uri: `${Constants.expoConfig?.extra?.USER_ICON}/${comment.user.id}.jpg`,
            width: 40,
            height: 40,
          }}
          alt={comment.user.id}
        />
        <YStack className="bg-background flex h-12 justify-center rounded-b-2xl p-2">
          <Text className="h-4 text-sm">{comment.user.name}</Text>
          <Text className="h-4 text-xs">{generalizeDate(comment.createdAt)}</Text>
        </YStack>
      </XStack>
      <Text className={"flex w-full justify-center truncate rounded-b-2xl py-2 text-xs"}>
        {clamp && (comment.comment?.length || 0) > 200 ? `${comment.comment?.slice(0, 200)}...` : comment.comment}
      </Text>
      {(comment.comment?.length || 0) > 200 && (
        <Pressable onPress={() => setClamp((prev) => !prev)}>
          <Text className="text-accent mt-1 text-[10px] font-bold">{clamp ? "SHOW MORE" : "SHOW LESS"}</Text>
        </Pressable>
      )}

      <XStack className="flex w-full justify-between pt-2">
        <XStack>
          <XStack>
            <Text className="mr-1">
              <Pressable onPress={handleLike}>
                <Heart color="black" fill={like ? theme.colors.accent : "none"} />
              </Pressable>
            </Text>
            <Text>{comment._count.likes}</Text>
          </XStack>
          <XStack className="ml-2">
            <Text className="mr-1">
              <Pressable onPress={handleDislike}>
                <HeartCrack color="black" fill={dislike ? theme.colors.accent : "none"} />
              </Pressable>
            </Text>
            <Text>{comment._count.dislikes}</Text>
          </XStack>
        </XStack>
        {comment.userId === auth.session.id && (
          <XStack className="ml-2">
            <Text onPress={() => mutateDelete({ id: comment.id })}>
              <Trash color="black" />
            </Text>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
};

export default CommentItem;
