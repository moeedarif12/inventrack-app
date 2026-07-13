import { Page, expect } from "@playwright/test";

export class AdminPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToUsers() {
    await this.page.goto("/admin/users");
  }

  async verifyUserInList(email: string) {
    await expect(this.page.locator(`td:has-text("${email}")`).first()).toBeVisible();
  }

  async changeUserRole(email: string, newRole: string) {
    const row = this.page.locator(`tr:has-text("${email}")`).first();
    await row.locator("button[title=\"Edit Role\"]").click();
    await this.page.selectOption("select", { label: newRole });
    await this.page.click("button:has-text(\"Save\")");
  }
}
