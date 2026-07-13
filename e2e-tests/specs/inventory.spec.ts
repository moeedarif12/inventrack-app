import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import testData from "../data/testData.json";

test.describe("Inventory Stock Adjustments", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should adjust stock levels manually", async ({ page }) => {
    const invPage = new InventoryPage(page);
    await invPage.navigate();
    await invPage.adjustStock("Coca Cola 1.5L", "in", 10, "Testing automated stock in");
  });
});
