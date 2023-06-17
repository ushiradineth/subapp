import React from "react";
import { Image, Text, XStack, YStack } from "tamagui";

import { type Product } from ".prisma/client";

interface Props {
  image: string;
  product: Product & { category: { name: string } };
  rating: number;
}

const ProductItemWide = ({ product, image, rating }: Props) => {
  return (
    <XStack className="bg-background flex w-full items-center justify-start rounded-2xl p-2">
      <Image className="bg-foreground rounded-t-2xl" source={{ uri: image, height: 144, width: 144 }} alt={product.name} />
      <YStack className="bg-background flex h-12 justify-center rounded-b-2xl p-2">
        <Text className="h-4 text-xs font-semibold">{product.name}</Text>
        <Text className="h-4 text-xs">{product.category.name}</Text>
        <Text className="h-4 text-xs">{rating}</Text>
      </YStack>
    </XStack>
  );
};

export default ProductItemWide;
