import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import testData from "../data/testData.json";

test.describe("Authentication Flow", () => {
  test("should login successfully with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
    await dashboardPage.verifyDashboardLoaded();
  });

  test("should display error message with invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(testData.auth.invalid.email, testData.auth.invalid.password);
    await expect(page).toHaveURL(/\/login/);
  });
});
