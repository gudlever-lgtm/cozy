// Local browser inspection of the native UI; never enables web in release builds.
const { spawn } = require("node:child_process");
const child = spawn(
  process.execPath,
  [require.resolve("expo/bin/cli"), "start", "--web", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      COZY_DESIGN_PREVIEW: "1",
      EXPO_NO_WEB_SETUP: "1",
      EXPO_OFFLINE: "1",
      BROWSER: "none",
    },
  },
);
child.on("exit", (code) => process.exit(code ?? 1));
