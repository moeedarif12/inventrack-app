# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: products.spec.ts >> Product Inventory Management >> should create a new product
- Location: specs\products.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Add Product")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - link "InvenTrack" [ref=e5] [cursor=pointer]:
      - /url: /
      - img [ref=e7]
      - generic [ref=e11]: InvenTrack
    - generic [ref=e12]:
      - blockquote [ref=e13]: "\"InvenTrack transformed how we manage our inventory. We went from spreadsheets to a professional dashboard in one day.\""
      - generic [ref=e14]:
        - generic [ref=e15]: MA
        - generic [ref=e16]:
          - paragraph [ref=e17]: Moeed Arif
          - paragraph [ref=e18]: Owner, InvenTrack Pakistan
    - paragraph [ref=e19]: © 2026 InvenTrack
  - generic [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e23]:
        - heading "Welcome back" [level=1] [ref=e24]
        - paragraph [ref=e25]: Sign in to your business dashboard
      - button "Fill Admin" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - text: Fill Admin
    - generic [ref=e29]:
      - generic [ref=e30]:
        - generic [ref=e31]: Email
        - generic [ref=e32]:
          - img [ref=e33]
          - textbox "you@business.com" [ref=e36]
      - generic [ref=e37]:
        - generic [ref=e38]: Password
        - generic [ref=e39]:
          - img [ref=e40]
          - textbox "••••••••" [ref=e43]
          - button [ref=e44] [cursor=pointer]:
            - img [ref=e45]
      - button "Sign In" [ref=e48] [cursor=pointer]:
        - text: Sign In
        - img [ref=e49]
    - paragraph [ref=e51]:
      - text: Don't have an account?
      - link "Create one" [ref=e52] [cursor=pointer]:
        - /url: /signup
```

# Test source

```ts
  1  | import { Page, expect } from "@playwright/test";
  2  | 
  3  | export class ProductsPage {
  4  |   readonly page: Page;
  5  | 
  6  |   constructor(page: Page) {
  7  |     this.page = page;
  8  |   }
  9  | 
  10 |   async navigate() {
  11 |     await this.page.goto("/products");
  12 |   }
  13 | 
  14 |   async addProduct(name: string, category: string, unit: string, buyingPrice: number, sellingPrice: number, currentStock: number, minimumStock: number, barcode: string, description: string) {
> 15 |     await this.page.click("button:has-text(\"Add Product\")");
     |                     ^ Error: page.click: Test timeout of 30000ms exceeded.
  16 |     await this.page.fill("input[placeholder=\"Product name\"]", name);
  17 |     await this.page.selectOption("select", { label: category });
  18 |     await this.page.fill("input[placeholder=\"Buying price\"]", buyingPrice.toString());
  19 |     await this.page.fill("input[placeholder=\"Selling price\"]", sellingPrice.toString());
  20 |     await this.page.fill("input[placeholder=\"Min alert stock\"]", minimumStock.toString());
  21 |     await this.page.fill("input[placeholder=\"EAN, UPC, or custom\"]", barcode);
  22 |     await this.page.fill("textarea[placeholder=\"Product description (optional)\"]", description);
  23 |     await this.page.click("button[type=\"submit\"]:has-text(\"Create\")");
  24 |   }
  25 | 
  26 |   async verifyProductInList(name: string) {
  27 |     await expect(this.page.locator(`td:has-text("${name}")`).first()).toBeVisible();
  28 |   }
  29 | }
  30 | 
```