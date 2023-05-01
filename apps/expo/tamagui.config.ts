import { createAnimations } from "@tamagui/animations-react-native";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { color, radius, size, space, themes, zIndex } from "@tamagui/themes";
import { createFont, createTamagui, createTokens } from "tamagui";

const animations = createAnimations({
  bouncy: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: "spring",
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

const createMontserratFont = () =>
  createFont({
    family: "Montserrat",
    size: {
      true: 14,
      1: 12,
      2: 14,
      3: 15,
    },
    lineHeight: {
      1: 17,
      2: 22,
      3: 25,
    },
    weight: {
      4: "300",
      6: "600",
    },
    letterSpacing: {
      4: 0,
      8: -1,
    },
    face: {
      700: { normal: "MontserratBold", italic: "MontserratBold-Italic" },
      800: { normal: "MontserratBold", italic: "MontserratBold-Italic" },
      900: { normal: "MontserratBold", italic: "MontserratBold-Italic" },
    },
  });

const headingFont = createMontserratFont();

const bodyFont = createMontserratFont();

const tokens = createTokens({
  size,
  space,
  radius,
  zIndex,
  color: {
    ...color,
    white: "#fff",
    black: "#000",
    accent: "#5D76CC",
  },
});

const config = createTamagui({
  animations,
  defaultTheme: "light",
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes,
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  }),
});

export type AppConfig = typeof config;
declare module "tamagui" {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
