# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sales.spec.ts >> POS & Sales checkout >> should record a sale transaction successfully
- Location: specs\sales.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("New Sale")')
    - locator resolved to <button class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground">New Sale (POS)</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Test source

```ts
  1  | import { Page, expect } from "@playwright/test";
  2  | 
  3  | export class SalesPage {
  4  |   readonly page: Page;
  5  | 
  6  |   constructor(page: Page) {
  7  |     this.page = page;
  8  |   }
  9  | 
  10 |   async navigateToNewSale() {
  11 |     await this.page.goto("/sales");
> 12 |     await this.page.click("button:has-text(\"New Sale\")");
     |                     ^ Error: page.click: Test timeout of 30000ms exceeded.
  13 |   }
  14 | 
  15 |   async addProductToCart(productName: string) {
  16 |     const card = this.page.locator(`button:has-text("${productName}")`).first();
  17 |     await card.click();
  18 |   }
  19 | 
  20 |   async setWalkInCustomer(name: string, phone: string) {
  21 |     await this.page.fill("input[placeholder=\"e.g. John Doe\"]", name);
  22 |     await this.page.fill("input[placeholder=\"e.g. +92...\"]", phone);
  23 |   }
  24 | 
  25 |   async completeSale(paymentMethod: string, paymentStatus: string) {
  26 |     await this.page.locator("label:has-text(\"Payment Method\") + select").selectOption({ label: paymentMethod });
  27 |     await this.page.locator("label:has-text(\"Payment Status\") + select").selectOption({ label: paymentStatus });
  28 |     await this.page.click("button[type=\"submit\"]:has-text(\"Record Transaction\")");
  29 |   }
  30 | }
  31 | 
```