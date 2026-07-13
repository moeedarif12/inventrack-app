import { Page, expect } from "@playwright/test";

export class CategoriesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/categories");
  }

  async addCategory(name: string, description: string, colorHex: string) {
    await this.page.click("button:has-text(\"Add Category\")");
    await this.page.fill("input[placeholder=\"Category name\"]", name);
    await this.page.fill("textarea[placeholder=\"Optional description\"]", description);
    const colorBtn = this.page.locator(`button[style*="${colorHex}"]`);
    if (await colorBtn.isVisible()) {
      await colorBtn.click();
    }
    await this.page.click("button[type=\"submit\"]:has-text(\"Create\")");
  }

  async verifyCategoryInList(name: string) {
    await expect(this.page.locator(`h3:has-text("${name}")`).first()).toBeVisible();
  }
}
