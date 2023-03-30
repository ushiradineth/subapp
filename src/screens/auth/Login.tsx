import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/utils/Theme";
import { supabase } from "@/utils/supabase";
import { TEST_PASSWORD, TEST_USERNAME } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Stack, Text, YStack } from "tamagui";

export default function Login({ navigation }: any) {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function login() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (!error && !data.user) {
      setLoading(false);
      alert("Check your email for the login link!asdsad");
    }

    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack f={1} jc="center" ai="center" backgroundColor={"$backgroundSoft"}>
          <Text fontWeight="bold" style={{ alignSelf: "center", padding: 30 }}>
            Login
          </Text>
          <Text>Email</Text>
          <Input style={{ marginTop: 15 }} placeholder="Enter your email" value={email} autoCapitalize="none" autoComplete="off" autoCorrect={false} keyboardType="email-address" onChangeText={(text) => setEmail(text)} />
          <Text style={{ marginTop: 15 }}>Password</Text>
          <Input style={{ marginTop: 15 }} placeholder="Enter your password" value={password} autoCapitalize="none" autoComplete="off" autoCorrect={false} secureTextEntry={true} onChangeText={(text) => setPassword(text)} />
          <Button onPress={() => login()} style={{ marginTop: 20 }} disabled={loading}>
            {loading ? "Loading" : "Continue"}
          </Button>
          <Stack
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15,
              justifyContent: "center",
            }}>
            <Text>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text fontWeight="bold" style={{ marginLeft: 5 }}>
                Register here
              </Text>
            </TouchableOpacity>
          </Stack>
          <Stack
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              justifyContent: "center",
            }}>
            <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
              <Text fontWeight="bold">Forget password</Text>
            </TouchableOpacity>
          </Stack>
          <Stack
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              justifyContent: "center",
            }}>
            <TouchableOpacity
              onPress={() =>
                supabase.auth.signInWithPassword({
                  email: TEST_USERNAME,
                  password: TEST_PASSWORD,
                })
              }>
              <Text fontWeight="bold">Auto login</Text>
            </TouchableOpacity>
          </Stack>
          <Stack
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 30,
              justifyContent: "center",
            }}>
            <TouchableOpacity onPress={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}>
              <Text fontWeight="bold" style={{ marginLeft: 5 }}>
                <Ionicons name={theme === "light" ? "sunny" : "moon"} size={20} />
              </Text>
            </TouchableOpacity>
          </Stack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
