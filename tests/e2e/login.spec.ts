import { expect, test } from "@playwright/test";

// Needs a live, migrated, seeded database (`pnpm db:migrate && pnpm db:seed`
// against a running Postgres — see docker/docker-compose.yml). Not runnable
// in this environment yet; verify once step 13 (dockerize) is done.
test("can sign in with the seeded admin and reach the dashboard", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByLabel("Username")
    .fill(process.env.SEED_ADMIN_USERNAME ?? "admin");
  await page
    .getByLabel("Password")
    .fill(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText(/Signed in as/)).toBeVisible();
});
