import React from "react";
import { useTheme } from "@/utils/Theme";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { Adapt, Button, Dialog, Fieldset, Input, Label, Paragraph, Sheet, Unspaced, YStack } from "tamagui";

export default function App() {
  const { theme } = useTheme();
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <YStack f={1} jc="center" ai="center" backgroundColor={"$backgroundSoft"}>
      <Paragraph color="$color" jc="center">
        {theme}
      </Paragraph>
      <Dialog modal>
        <Dialog.Trigger asChild>
          <Button theme="blue_Button">Edit Profile</Button>
        </Dialog.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet zIndex={200000} modal dismissOnSnapToBottom>
            <Sheet.Frame padding="$4" space>
              <Adapt.Contents />
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>

        <Dialog.Portal>
          <Dialog.Overlay key="overlay" animation="quick" o={0.5} enterStyle={{ o: 0 }} exitStyle={{ o: 0 }} />

          <Dialog.Content bordered elevate key="content" animation={["quick", { opacity: { overshootClamping: true } }]} enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }} exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }} space>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>Make changes to your profile here. Click save when you&apos;re done.</Dialog.Description>
            <Fieldset>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Nate Wienert" />
            </Fieldset>
            <YStack alignItems="flex-end" marginTop="$2">
              <Dialog.Close displayWhenAdapted asChild>
                <Button theme="green_Button" aria-label="Close">
                  Save changes
                </Button>
              </Dialog.Close>
            </YStack>

            <Unspaced>
              <Dialog.Close asChild>
                <Button pos="absolute" top="$3" right="$3" size="$2" circular />
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
      <StatusBar style="auto" />
    </YStack>
  );
}
