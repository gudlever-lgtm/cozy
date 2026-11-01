const shared = {
  testMatch: ["**/tests/native/**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/native/setup.ts"],
  clearMocks: true,
};
module.exports = {
  projects: [
    { ...shared, displayName: "ios", preset: "jest-expo/ios" },
    { ...shared, displayName: "android", preset: "jest-expo/android" },
  ],
};
