import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { SalesPage } from "../pages/SalesPage";
import testData from "../data/testData.json";

test.describe("POS & Sales checkout", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should record a sale transaction successfully", async ({ page }) => {
    const salesPage = new SalesPage(page);
    await salesPage.navigateToNewSale();
    await salesPage.addProductToCart("Coca Cola 1.5L");
    await salesPage.setWalkInCustomer("E2E Sale Customer", "+923001234567");
    await salesPage.completeSale("Cash", "Paid");
  });
});
