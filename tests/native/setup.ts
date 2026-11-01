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
}));
jest.mock("../../src/Audio", () => ({ Audio: () => null }));

import { configure } from "@testing-library/react-native";
configure({ asyncUtilTimeout: 5000 });
