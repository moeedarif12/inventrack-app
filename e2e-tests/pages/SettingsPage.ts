import { Page, expect } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/settings");
  }

  async updateBusinessProfile(name: string, taxRate: number) {
    await this.page.click("button:has-text(\"Business Profile\")");
    await this.page.locator("label:has-text(\"Business Name\") + input").fill(name);
    await this.page.locator("label:has-text(\"Standard GST\") + input").fill(taxRate.toString());
    await this.page.click("button[type=\"submit\"]:has-text(\"Save Settings\")");
  }
}
