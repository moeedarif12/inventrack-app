import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";
import testData from "../data/testData.json";

test.describe("Product Inventory Management", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should create a new product", async ({ page }) => {
    const prodPage = new ProductsPage(page);
    await prodPage.navigate();
    await prodPage.addProduct(
      testData.product.name,
      "Groceries",
      testData.product.unit,
      testData.product.buyingPrice,
      testData.product.sellingPrice,
      testData.product.currentStock,
      testData.product.minimumStock,
      testData.product.barcode,
      testData.product.description
    );
    await prodPage.verifyProductInList(testData.product.name);
  });
});
