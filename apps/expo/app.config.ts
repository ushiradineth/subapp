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
  },
  owner: "ushiradineth",
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
