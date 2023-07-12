import React, { useContext } from "react";
import { Text } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Edit, LogOut } from "lucide-react-native";
import { Image, ScrollView, XStack, YStack } from "tamagui";

import { api } from "~/utils/api";
import { generalizeDate } from "~/utils/utils";
import ButtonWide from "~/components/Atoms/ButtonWide";
import { Spinner } from "~/components/Atoms/Spinner";
import { AuthContext } from "~/app/_layout";

export default function Profile() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { data: user } = api.user.profile.useQuery();

  return (
    <ScrollView className="h-fit px-4 py-6" backgroundColor="$background">
      <YStack className="flex-1 items-center justify-center" space>
        <XStack className="flex w-full items-center justify-center" space={"$4"}>
          <Image
            source={{
              width: 144,
              height: 144,
              uri: `${Constants.expoConfig?.extra?.USER_ICON}/${auth.session.id}/0.jpg`,
            }}
            alt={auth.session.name}
            className="bg-foreground h-24 w-24 rounded-full"
          />
          <YStack>
            <Text className="text-2xl font-bold">{auth.session.name}</Text>
            {user && <Text className="text-foreground text-sm">Joined {generalizeDate(user.joined)}</Text>}
          </YStack>
        </XStack>
        <YStack className="bg-background flex h-28 w-full items-center justify-center rounded-3xl p-4" space={"$1"}>
          {user ? (
            <>
              <Text className="text-center text-lg font-bold">Current Monthly Bill</Text>
              <Text className="text-accent text-center text-lg font-bold">${user.cost?.toFixed(2)}</Text>
              <Text className="text-foreground text-center text-sm font-bold">{user.count} Subscriptions</Text>
            </>
          ) : (
            <Spinner />
          )}
        </YStack>

        <ButtonWide onPress={() => router.push("/profile/edit")} icon={<Edit color="black" className="mx-4" />} text="Edit profile" />
        <ButtonWide onPress={() => auth.logout()} icon={<LogOut color="black" className="mx-4" />} text="Log out" />
      </YStack>
    </ScrollView>
  );
}
