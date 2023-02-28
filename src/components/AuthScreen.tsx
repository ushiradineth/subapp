import { Box, NativeBaseProvider, Pressable, Text, Flex, Spacer, Badge, HStack } from "native-base";
import React from "react";
import { Button, SafeAreaView } from "react-native";
import { supabase } from "../utils/supabase";

async function signIn() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });

  console.log(data, error);
  return data;
}

export default function AuthScreen({ navigation }: any) {
  async function register() {
    const { data, error } = await supabase.auth.signUp({
      email: "ushiradineth@gmail.com",
      password: "test1234",
    });

    if (!error && !data) {
      alert("Check your email for the login link!");
    }
    if (error) {
      alert(error.message);
    }

    console.log(data, error);
    
  }
  return (
    <NativeBaseProvider>
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Home Screen</Text>
        <Box alignItems="center" my={10}>
          <Pressable onPress={() => console.log("I'm Pressed")} rounded="8" overflow="hidden" borderWidth="1" borderColor="coolGray.300" maxW="96" shadow="3" bg="coolGray.100" p="5">
            <Box>
              <HStack alignItems="center">
                <Badge
                  colorScheme="darkBlue"
                  _text={{
                    color: "white",
                  }}
                  variant="solid"
                  rounded="4">
                  Business
                </Badge>
                <Spacer />
                <Text fontSize={10} color="coolGray.800">
                  1 month ago
                </Text>
              </HStack>
              <Text color="coolGray.800" mt="3" fontWeight="medium" fontSize="xl">
                Marketing License
              </Text>
              <Text mt="2" fontSize="sm" color="coolGray.700">
                Unlock powerfull time-saving tools for creating email delivery and collecting marketing data
              </Text>
              <Flex>
                <Text mt="2" fontSize={12} fontWeight="medium" color="darkBlue.600">
                  Read More
                </Text>
              </Flex>
            </Box>
          </Pressable>
        </Box>
        <Button title="signIn" onPress={() => register()} />
      </SafeAreaView>
    </NativeBaseProvider>
  );
}
