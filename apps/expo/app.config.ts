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
    permissions: ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"],
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
    PRODUCT_LOGO: "https://subm-product-logos.s3.ap-southeast-1.amazonaws.com",
    PRODUCT_IMAGE: "https://subm-product-images.s3.ap-southeast-1.amazonaws.com",
    USER_ICON: "https://subm-user-icons.s3.ap-southeast-1.amazonaws.com",
    TEMPLATE_ICON: "https://subm-template-icons.s3.ap-southeast-1.amazonaws.com",
    CATEGORY_ICON: "https://subm-category-icons.s3.ap-southeast-1.amazonaws.com",
  },
  owner: "ushiradineth",
});

export default defineConfig;
