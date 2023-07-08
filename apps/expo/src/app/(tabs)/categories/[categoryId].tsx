import { View } from "react-native";
import Constants from "expo-constants";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

const Category: React.FC = () => {
  const { categoryId } = useSearchParams();
  const router = useRouter();

  const { data: category } = api.category.getById.useQuery({ id: typeof categoryId !== "undefined" ? (categoryId as string) : "" });

  if (!category) return <Spinner background />;
  if (category.products.length === 0) return <NoData>No products yet</NoData>;

  return (
    <ScrollView backgroundColor="$background">
      <Stack.Screen
        options={{
          headerTitle: category.name,
        }}
      />
      <YStack space className="p-4">
        {category?.products.map((product) => (
          <CardItemWide
            key={product.id}
            onPress={() => {
              router.back();
              router.replace(`product/${product.id}`);
            }}
            title={product.name}
            text1={`${product._count.subscriptions} subscriptions`}
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}/0.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
};

export default Category;
