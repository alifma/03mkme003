import { expect, test } from "@playwright/test";

test("homepage is publicly accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SIBER_" })).toBeVisible();
  // Rendered as an <a> via Button's `render` prop with `nativeButton={false}`
  // — Base UI applies role="button" explicitly in that case (see home-content.tsx).
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("visiting /dashboard while signed out redirects to /login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
});

test("login page renders the credentials form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
