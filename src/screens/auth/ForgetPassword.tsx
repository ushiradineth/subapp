import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/utils/Theme";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { TopNavigation } from "@ui-kitten/components";
import { Button, Input, Stack, Text } from "tamagui";

export default function ({ navigation }: any) {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function forget() {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (!error) {
      setLoading(false);
      alert("Check your email to reset your password!");
    }

    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Stack>
        <TopNavigation title={(evaProps) => <Text {...evaProps}>Home</Text>} accessoryLeft={() => navigation.navigate("Login")} accessoryRight={() => <Ionicons name={theme ? "sunny" : "moon"} size={20} />} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Stack
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              justifyContent: "center",
            }}>
            <Text fontWeight="bold" style={{ alignSelf: "center", padding: 30 }}>
              Forget Password
            </Text>
            <Text>Email</Text>
            <Input style={{ marginTop: 15 }} placeholder="Enter your email" value={email} autoCapitalize="none" autoComplete="off" autoCorrect={false} keyboardType="email-address" onChangeText={(text) => setEmail(text)} />
            <Button onPress={() => forget()} style={{ marginTop: 20 }} disabled={loading}>
              {loading ? "Loading" : "Send email"}
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
      </Stack>
    </KeyboardAvoidingView>
  );
}
