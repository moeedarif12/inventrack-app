import { Page, expect } from "@playwright/test";

export class SalesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToNewSale() {
    await this.page.goto("/sales");
    await this.page.click("button:has-text(\"New Sale\")");
  }

  async addProductToCart(productName: string) {
    const card = this.page.locator(`button:has-text("${productName}")`).first();
    await card.click();
  }

  async setWalkInCustomer(name: string, phone: string) {
    await this.page.fill("input[placeholder=\"e.g. John Doe\"]", name);
    await this.page.fill("input[placeholder=\"e.g. +92...\"]", phone);
  }

  async completeSale(paymentMethod: string, paymentStatus: string) {
    await this.page.locator("label:has-text(\"Payment Method\") + select").selectOption({ label: paymentMethod });
    await this.page.locator("label:has-text(\"Payment Status\") + select").selectOption({ label: paymentStatus });
    await this.page.click("button[type=\"submit\"]:has-text(\"Record Transaction\")");
  }
}
