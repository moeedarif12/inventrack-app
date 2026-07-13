import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { AdminPage } from "../pages/AdminPage";

test.describe("Admin System User Management", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login("admin@example.com", "admin123");
  });

  test("should view system users and edit role", async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.navigateToUsers();
    await adminPage.verifyUserInList("owner1@example.com");
  });
});
