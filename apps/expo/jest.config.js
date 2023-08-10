module.exports = {
  preset: "jest-expo",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react"
      }
    }]
  },
  testMatch: [
    "**/?(*.)+(spec|test).ts?(x)"
  ],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js"
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|react=native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|sentry-expo|native-base)", "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))"
  ],
  coverageReporters: [
    "json-summary",
    "text",
    "lcov"
  ],
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
};