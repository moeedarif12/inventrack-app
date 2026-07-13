import { Page, expect } from "@playwright/test";

export class CustomersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/customers");
  }

  async addCustomer(name: string, email: string, phone: string, street: string, city: string) {
    await this.page.click("button:has-text(\"Add Customer\")");
    await this.page.fill("input[placeholder=\"Customer name\"]", name);
    await this.page.fill("input[placeholder=\"Email address\"]", email);
    await this.page.fill("input[placeholder=\"Phone number\"]", phone);
    await this.page.fill("input[placeholder=\"Street address\"]", street);
    await this.page.fill("input[placeholder=\"City\"]", city);
    await this.page.click("button[type=\"submit\"]:has-text(\"Create\")");
  }

  async verifyCustomerInList(name: string) {
    await expect(this.page.locator(`td:has-text("${name}")`).first()).toBeVisible();
  }
}
