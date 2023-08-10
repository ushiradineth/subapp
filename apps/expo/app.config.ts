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
        photosPermission: "The app accesses your photos to use them as assets on SubM.",
      },
    ],
    "./expo-plugins/with-modify-gradle.js",
  ],
  extra: {
    eas: {
      projectId: "c04f12c2-1b92-4789-99f7-9374fffca094",
    },
    WEB_URL: process.env.EXPO_PUBLIC_API_URL ?? "https://subapp.vercel.app",
    PRODUCT_LOGO: "https://subm-ushiradineth-product-logos.s3.ap-southeast-1.amazonaws.com",
    PRODUCT_IMAGE: "https://subm-ushiradineth-product-images.s3.ap-southeast-1.amazonaws.com",
    USER_ICON: "https://subm-ushiradineth-user-icons.s3.ap-southeast-1.amazonaws.com",
    TEMPLATE_ICON: "https://subm-ushiradineth-template-icons.s3.ap-southeast-1.amazonaws.com",
    CATEGORY_ICON: "https://subm-ushiradineth-category-icons.s3.ap-southeast-1.amazonaws.com",
  },
  owner: "ushiradineth",
});

export default defineConfig;
