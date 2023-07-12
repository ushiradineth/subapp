import type { ExpoConfig } from "@expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "SubM",
  slug: "subm",
  scheme: "subm",
  description:
    "SubM: Subscription management platform for small businesses. Connect subscriptions, consumers & providers. Manage all in one place.",
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
    url: "https://u.expo.dev/c04f12c2-1b92-4789-99f7-9374fffca094",
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ushiradineth.subm",
    buildNumber: "1.0.0",
  },
  android: {
    package: "com.ushiradineth.subm",
    versionCode: 1,
  },
  plugins: [
    [
      "expo-image-picker",
      {
        photosPermission: "The app accesses your photos to let you share them with your friends.",
      },
    ],
    "./expo-plugins/with-modify-gradle.js",
  ],
  extra: {
    eas: {
      projectId: "c04f12c2-1b92-4789-99f7-9374fffca094",
    },
    WEB_URL: process.env.EXPO_PUBLIC_API_URL ?? "https://subapp.vercel.app",
    PRODUCT_LOGO: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/PRODUCT_LOGO",
    PRODUCT_IMAGE: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/PRODUCT_IMAGE",
    USER_ICON: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/USER_ICON",
    TEMPLATE_ICON: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/TEMPLATE_ICON",
    CATEGORY_ICON: "https://pwnatkddgcrwrcdpxdxu.supabase.co/storage/v1/object/public/CATEGORY_ICON",
    USER_ICON_BUCKET: "USER_ICON",
    TEMPLATE_ICON_BUCKET: "TEMPLATE_ICON",
    SUPABASE_PROJECT: "pwnatkddgcrwrcdpxdxu",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bmF0a2RkZ2Nyd3JjZHB4ZHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY3NjM3MDQsImV4cCI6MjAwMjMzOTcwNH0.O0GqjwMa76r8bwpv5uByhUkUOnAcz6M4vtHogPd6eQg",
  },
  owner: "ushiradineth",
});

export default defineConfig;
