import { Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("/login");
  }

  async login(email: string, pass: string) {
    await this.page.fill("input[type=\"email\"]", email);
    await this.page.fill("input[type=\"password\"]", pass);
    await this.page.click("button[type=\"submit\"]");
    if (email !== "invalid@example.com") {
      await this.page.waitForURL(url => url.pathname.includes("/dashboard") || url.pathname.includes("/admin/"), { timeout: 15000 });
    }
  }
}
