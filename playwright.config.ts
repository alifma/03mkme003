import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Loaded here (main Playwright process) so it propagates to the dev server
// spawned by webServer below and to worker processes running the specs.
// Safe because neither import above reads process.env at module-load time —
// only the defineConfig() call below does.
loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
