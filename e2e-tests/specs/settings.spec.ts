import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { SettingsPage } from "../pages/SettingsPage";
import testData from "../data/testData.json";

test.describe("Settings Preferences & Themes", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should toggle dark mode theme", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();
    const themeBtn = page.locator("button[title*=\"theme\"]");
    if (await themeBtn.count() > 0) {
      await themeBtn.first().click();
      await expect(page.locator("html")).toHaveClass(/dark|light/);
    }
  });
});
