import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL: "http://127.0.0.1:8081",
    launchOptions: {
      executablePath: process.env.CI ? undefined : "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    headless: true,
  },
  workers: 1,
  reporter: "list",
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "phone",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
