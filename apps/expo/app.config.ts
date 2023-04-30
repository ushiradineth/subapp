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
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A",
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
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1F104A",
    },
  },
  extra: {
    eas: {
      projectId: "0dc6749a-cb3d-4fe0-80aa-f2a7ba811017",
    },
    CLERK_PUBLISHABLE_KEY:
      "pk_test_c2VsZWN0LXN0YXJsaW5nLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ",
  },
  owner: "ushiradineth",
  plugins: ["./expo-plugins/with-modify-gradle.js"],
});

export default defineConfig;
