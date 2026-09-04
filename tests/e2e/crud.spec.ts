import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page
    .getByLabel("Username")
    .fill(process.env.SEED_ADMIN_USERNAME ?? "admin");
  await page
    .getByLabel("Password")
    .fill(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/dashboard");
}

/** Clicks a row's trash-icon trigger, then confirms inside the opened dialog. */
async function confirmDelete(page: Page, rowText: string) {
  await page
    .getByRole("row")
    .filter({ hasText: rowText })
    .getByRole("button", { name: "Delete" })
    .click();
  const dialog = page.locator('[data-slot="alert-dialog-content"]');
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
}

// Needs a live, migrated, seeded database — same requirement as login.spec.ts.
test("admin can create a role, assign it to a new user, then delete both", async ({
  page,
}) => {
  await loginAsAdmin(page);

  const stamp = Date.now();
  const roleName = `qa-role-${stamp}`;
  const userUsername = `qa-user-${stamp}`;
  const userEmail = `qa-user-${stamp}@example.com`;

  // Create a role with a couple of permissions — Users/Roles/Kas use modal
  // dialogs (see *-form-dialog.tsx), not separate /new pages, for create/edit.
  await page.goto("/dashboard/roles");
  await page.getByRole("button", { name: "New role" }).click();
  const roleDialog = page.locator('[data-slot="dialog-content"]');
  await roleDialog.getByLabel("Name").fill(roleName);
  // Base UI's Checkbox renders a visible styled span *and* a visually/ARIA
  // hidden native <input>, both label-associated — getByRole (which respects
  // aria-hidden) resolves to just the real one; getByLabel would be ambiguous.
  await roleDialog.getByRole("checkbox", { name: "Dashboard view" }).check();
  await roleDialog.getByRole("checkbox", { name: "Users read" }).check();
  await roleDialog.getByRole("button", { name: "Create role" }).click();

  await expect(roleDialog).not.toBeVisible();
  const roleRow = page.getByRole("row").filter({ hasText: roleName });
  await expect(roleRow).toBeVisible();
  await expect(roleRow.getByRole("cell").nth(2)).toHaveText("2"); // permission count

  // Create a user and assign the new role.
  await page.goto("/dashboard/users");
  await page.getByRole("button", { name: "New user" }).click();
  const userDialog = page.locator('[data-slot="dialog-content"]');
  await userDialog.getByLabel("Username").fill(userUsername);
  await userDialog.getByLabel("Email").fill(userEmail);
  await userDialog.getByLabel("Password").fill("Password123!");
  await userDialog.getByRole("checkbox", { name: roleName }).check();
  await userDialog.getByRole("button", { name: "Create user" }).click();

  await expect(userDialog).not.toBeVisible();
  const userRow = page.getByRole("row").filter({ hasText: userEmail });
  await expect(userRow).toBeVisible();
  await expect(userRow).toContainText(roleName);

  // Deleting the role while it's assigned to the user must be blocked.
  await page.goto("/dashboard/roles");
  await confirmDelete(page, roleName);
  await expect(
    page.getByText(/still assigned to one or more users/),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  // Clean up: delete the user first, then the now-unassigned role.
  await page.goto("/dashboard/users");
  await confirmDelete(page, userEmail);
  await expect(
    page.getByRole("row").filter({ hasText: userEmail }),
  ).toHaveCount(0);

  await page.goto("/dashboard/roles");
  await confirmDelete(page, roleName);
  await expect(page.getByRole("row").filter({ hasText: roleName })).toHaveCount(
    0,
  );
});
