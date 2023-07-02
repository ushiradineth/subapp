import React from "react";
import { Image, Text, XStack, YStack } from "tamagui";

import { type Notification } from ".prisma/client";

interface Props {
  notification: Notification;
}

const NotificationItem = ({ notification }: Props) => {
  throw new Error("Not implemented");
  return (
    <XStack className="bg-background flex w-full items-center justify-start rounded-2xl p-2">
      <YStack className="bg-background flex h-12 justify-center rounded-b-2xl p-2">
        <Text className="h-4 text-xs">{notification}</Text>
      </YStack>
      {/* <Image className="bg-foreground rounded-t-2xl" source={{ uri: image, height: 144, width: 144 }} alt={product.name} /> */}
    </XStack>
  );
};

export default NotificationItem;
