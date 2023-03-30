import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/utils/Theme";
import { supabase } from "@/utils/supabase";
import { Button, Input, Stack, Text } from "tamagui";

export default function Register({ navigation }: any) {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function register() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (!error && !data) {
      setLoading(false);
      alert("Check your email for the login link!");
    }

    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Stack
          style={{
            flex: 3,
            paddingHorizontal: 20,
            paddingBottom: 20,
            justifyContent: "center",
          }}>
          <Text fontWeight="bold" style={{ alignSelf: "center", padding: 30 }}>
            Register
          </Text>
          <Text>Email</Text>
          <Input style={{ marginTop: 15 }} placeholder="Enter your email" value={email} autoCapitalize="none" autoComplete="off" autoCorrect={false} keyboardType="email-address" onChangeText={(text) => setEmail(text)} />
          <Text style={{ marginTop: 15 }}>Password</Text>
          <Input style={{ marginTop: 15 }} placeholder="Enter your password" value={password} autoCapitalize="none" autoComplete="off" autoCorrect={false} secureTextEntry={true} onChangeText={(text) => setPassword(text)} />
          <Button onPress={() => register()} style={{ marginTop: 20 }} disabled={loading}>
            {loading ? "Loading" : "Create an account"}
          </Button>
          <Stack
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15,
              justifyContent: "center",
            }}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text fontWeight="bold" style={{ marginLeft: 5 }}>
                Login here
              </Text>
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
                {theme === "light" ? "☀️ light theme" : "🌑 dark theme"}
              </Text>
            </TouchableOpacity>
          </Stack>
        </Stack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
