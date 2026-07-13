import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import testData from "../data/testData.json";

test.describe("Category Catalog Management", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should create a new category", async ({ page }) => {
    const catPage = new CategoriesPage(page);
    await catPage.navigate();
    await catPage.addCategory(testData.category.name, testData.category.description, testData.category.color);
    await catPage.verifyCategoryInList(testData.category.name);
  });
});
