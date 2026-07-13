import { Page, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyDashboardLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.page.locator("text=Welcome back").first()).toBeVisible();
  }

  async verifyMetricsVisible() {
    await expect(this.page.locator("text=Total Sales").first()).toBeVisible();
    await expect(this.page.locator("text=Low Stock Items").first()).toBeVisible();
  }
}
