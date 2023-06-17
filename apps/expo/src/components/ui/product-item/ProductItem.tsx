import React from "react";
import { useRouter } from "expo-router";
import { Image, Text, YStack } from "tamagui";

import { type Product } from ".prisma/client";

interface Props {
  image: string;
  product: Product & { category: { name: string } };
}

const ProductItem = ({ image, product }: Props) => {
  const router = useRouter();

  return (
    <YStack onPress={() => router.push(`/product/${product.id}`)} className="w-36">
      <Image className="bg-foreground rounded-t-2xl" source={{ uri: image, height: 144, width: 144 }} alt={product.name} />
      <YStack className="bg-background flex h-12 w-full justify-center rounded-b-2xl pl-2">
        <Text className="h-4 text-xs font-semibold">{product.name}</Text>
        <Text className="h-4 text-xs">{product.category.name}</Text>
      </YStack>
    </YStack>
  );
};

export default ProductItem;
