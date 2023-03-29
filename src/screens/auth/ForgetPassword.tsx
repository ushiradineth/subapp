import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View, KeyboardAvoidingView } from "react-native";
import { supabase } from "../../utils/supabase";
import { Text, TextInput, Button, useTheme, themeColor, TopNav, Layout } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

export default function ({ navigation }: any) {
  const { isDarkmode, setTheme } = useTheme();
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
      <Layout>
        <TopNav
          middleContent="Home"
          rightContent={<Ionicons name={isDarkmode ? "sunny" : "moon"} size={20} color={isDarkmode ? themeColor.white100 : themeColor.dark} />}
          rightAction={() => {
            navigation.navigate("Login");
          }}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 3, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: isDarkmode ? themeColor.dark : themeColor.white, justifyContent: "center" }}>
            <Text size="h3" fontWeight="bold" style={{ alignSelf: "center", padding: 30 }}>
              Forget Password
            </Text>
            <Text>Email</Text>
            <TextInput containerStyle={{ marginTop: 15 }} placeholder="Enter your email" value={email} autoCapitalize="none" autoComplete="off" autoCorrect={false} keyboardType="email-address" onChangeText={(text) => setEmail(text)} />
            <Button text={loading ? "Loading" : "Send email"} onPress={() => forget()} style={{ marginTop: 20 }} disabled={loading} />
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 15, justifyContent: "center" }}>
              <Text size="md">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text size="md" fontWeight="bold" style={{ marginLeft: 5 }}>
                  Login here
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30, justifyContent: "center" }}>
              <TouchableOpacity onPress={() => (isDarkmode ? setTheme("light") : setTheme("dark"))}>
                <Text size="md" fontWeight="bold" style={{ marginLeft: 5 }}>
                  {isDarkmode ? "☀️ light theme" : "🌑 dark theme"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
