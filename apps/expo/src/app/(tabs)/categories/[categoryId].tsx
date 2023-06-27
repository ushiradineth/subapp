import { View } from "react-native";
import Constants from "expo-constants";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";

import { api } from "~/utils/api";
import { Spinner } from "~/components/Spinner";
import CardItemWide from "~/components/ui/card-item-wide/CardItemWide";

const Category: React.FC = () => {
  const { categoryId } = useSearchParams();
  const router = useRouter();

  const { data: category } = api.category.getById.useQuery({ id: typeof categoryId !== "undefined" ? (categoryId as string) : "" });

  if (!category) return <Spinner background />;

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerTitle: category.name,
        }}
      />
      <ScrollView className="mb-10" backgroundColor="$background">
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
          {category.products.length === 0 && <Text>No products yet</Text>}
        </YStack>
      </ScrollView>
    </View>
  );
};

export default Category;
