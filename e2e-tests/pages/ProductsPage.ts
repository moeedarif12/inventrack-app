import { Page, expect } from "@playwright/test";

export class ProductsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/products");
  }

  async addProduct(name: string, category: string, unit: string, buyingPrice: number, sellingPrice: number, currentStock: number, minimumStock: number, barcode: string, description: string) {
    await this.page.click("button:has-text(\"Add Product\")");
    await this.page.fill("input[placeholder=\"Product name\"]", name);
    await this.page.selectOption("select:has(option:has-text(\"Select Category\"))", { label: category });
    await this.page.selectOption("select:has(option:has-text(\"pcs\"))", { label: unit });
    await this.page.fill("input[placeholder=\"Buying price\"]", buyingPrice.toString());
    await this.page.fill("input[placeholder=\"Selling price\"]", sellingPrice.toString());
    await this.page.fill("input[placeholder=\"Min alert stock\"]", minimumStock.toString());
    await this.page.fill("input[placeholder=\"EAN, UPC, or custom\"]", barcode);
    await this.page.fill("textarea[placeholder=\"Product description (optional)\"]", description);
    await this.page.click("button[type=\"submit\"]:has-text(\"Create\")");
  }

  async verifyProductInList(name: string) {
    await expect(this.page.locator(`td:has-text("${name}")`).first()).toBeVisible();
  }
}
