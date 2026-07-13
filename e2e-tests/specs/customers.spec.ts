import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CustomersPage } from "../pages/CustomersPage";
import testData from "../data/testData.json";

test.describe("Customer Records Management", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.auth.valid.email, testData.auth.valid.password);
  });

  test("should create a new customer profile", async ({ page }) => {
    const custPage = new CustomersPage(page);
    await custPage.navigate();
    await custPage.addCustomer(
      testData.customer.name,
      testData.customer.email,
      testData.customer.phone,
      testData.customer.address,
      "Lahore"
    );
    await custPage.verifyCustomerInList(testData.customer.name);
  });
});
