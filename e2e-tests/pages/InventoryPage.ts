import { Page, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/inventory");
  }

  async adjustStock(productName: string, action: "in" | "out" | "adjust", quantity: number, notes: string) {
    const row = this.page.locator(`tr:has-text("${productName}")`).first();
    if (action === "in") {
      await row.locator("button[title=\"Stock In\"]").click();
    } else if (action === "out") {
      await row.locator("button[title=\"Stock Out\"]").click();
    } else if (action === "adjust") {
      await row.locator("button[title=\"Adjust Stock\"]").click();
    }

    await this.page.fill("input[type=\"number\"]", quantity.toString());
    await this.page.fill("textarea[placeholder=\"Provide context...\"]", notes);
    await this.page.click("button[type=\"submit\"]:has-text(\"Submit\")");
  }

  async verifyClosingStock(productName: string, expectedStock: string) {
    const row = this.page.locator(`tr:has-text("${productName}")`).first();
    await expect(row.locator("td").nth(3)).toContainText(expectedStock);
  }
}
