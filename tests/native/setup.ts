jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en", languageTag: "en-GB" }],
}));
jest.mock("expo-crypto", () => {
  let id = 0;
  return { randomUUID: () => `native-test-${++id}` };
});
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: require("react-native").View,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("../../src/Audio", () => ({ Audio: () => null }));

import { configure } from "@testing-library/react-native";
configure({ asyncUtilTimeout: 5000 });

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: () => false,
}));
