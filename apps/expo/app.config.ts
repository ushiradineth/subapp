import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "subapp",
  slug: "subapp",
  scheme: "subapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splashscreen.png",
    resizeMode: "contain",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "your.bundle.identifier",
  },
  android: {
    adaptiveIcon: {
      backgroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
  },
  extra: {
    eas: {
      projectId: "0dc6749a-cb3d-4fe0-80aa-f2a7ba811017",
    },
    WEB_URL: "https://subapp.vercel.app",
    PRODUCT_LOGO: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/PRODUCT_LOGO",
    PRODUCT_IMAGE: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/PRODUCT_IMAGE",
    USER_ICON: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/USER_ICON",
    USER_ICON_BUCKET: "USER_ICON",
    SUPABASE_PROJECT: "pwnatkddgcrwrcdpxdxu",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bmF0a2RkZ2Nyd3JjZHB4ZHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY3NjM3MDQsImV4cCI6MjAwMjMzOTcwNH0.O0GqjwMa76r8bwpv5uByhUkUOnAcz6M4vtHogPd6eQg",
  },
  owner: "ushiradineth",
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
