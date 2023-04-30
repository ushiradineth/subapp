process.env.TAMAGUI_TARGET = "native";

/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache.forever();

  // Make Expo Router run from `src/app` instead of `app`.
  // Path is relative to `/node_modules/expo-router`
  process.env.EXPO_ROUTER_APP_ROOT = "../../apps/expo/src/app";

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "expo-router/babel",
      ["module-resolver", { alias: { "~": "./src" } }],
      [
        "transform-inline-environment-variables",
        {
          include: "TAMAGUI_TARGET",
        },
      ],
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
