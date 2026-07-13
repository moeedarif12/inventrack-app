import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { SettingsPage } from "../pages/SettingsPage";
import testData from "../data/testData.json";

test.describe("Business Profile Settings", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should update business info successfully", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();
    await settingsPage.updateBusinessProfile(testData.business.name, testData.business.taxRate);
  });
});
