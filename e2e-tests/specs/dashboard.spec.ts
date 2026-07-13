import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import testData from "../data/testData.json";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should display total sales and warnings metrics", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.verifyMetricsVisible();
  });
});
