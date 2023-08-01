import { RefreshControl } from "react-native";
import Constants from "expo-constants";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { ScrollView, YStack } from "tamagui";

import { api } from "~/utils/api";
import { trimString } from "~/utils/utils";
import CardItemWide from "~/components/Atoms/CardItemWide";
import NoData from "~/components/Atoms/NoData";
import { Spinner } from "~/components/Atoms/Spinner";

const Category: React.FC = () => {
  const { categoryId } = useSearchParams();
  const router = useRouter();

  const { mutate } = api.category.categoryVisit.useMutation();
  const {
    data: category,
    isLoading,
    refetch,
    isRefetching,
  } = api.category.getById.useQuery(
    {
      id: typeof categoryId !== "undefined" ? (categoryId as string) : "",
    },
    { onSuccess: (data) => mutate({ id: data?.id ?? "" }) },
  );

  if (isLoading) return <Spinner background />;
  if (!category) return <NoData background>No category found</NoData>;
  if (category.products.length === 0) return <NoData background>No products yet</NoData>;

  return (
    <ScrollView
      backgroundColor="$background"
      refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
      <Stack.Screen
        options={{
          headerTitle: trimString(category.name ?? "", 18),
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
            title={trimString(product.name, 16)}
            text1={trimString(`${product._count.subscriptions} subscriptions`, 18)}
            image={`${Constants.expoConfig?.extra?.PRODUCT_LOGO}/${product.id}.jpg`}
          />
        ))}
      </YStack>
    </ScrollView>
  );
};

export default Category;
