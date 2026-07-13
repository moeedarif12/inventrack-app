# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: products.spec.ts >> Product Inventory Management >> should create a new product
- Location: specs\products.spec.ts:13:7

# Error details

```
Error: locator.selectOption: Error: strict mode violation: locator('div:has(label:has-text("Category"))').locator('select') resolved to 4 elements:
    1) <select class="form-input">…</select> aka getByRole('combobox').first()
    2) <select class="form-input">…</select> aka getByRole('combobox').nth(1)
    3) <select required="" class="form-input">…</select> aka getByRole('combobox').nth(2)
    4) <select class="form-input text-foreground bg-background">…</select> aka getByRole('combobox').nth(3)

Call log:
  - waiting for locator('div:has(label:has-text("Category"))').locator('select')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e12]:
        - heading "InvenTrack" [level=1] [ref=e13]
        - paragraph [ref=e14]: Business Suite
    - generic [ref=e16]:
      - generic [ref=e18]: S
      - generic [ref=e19]:
        - paragraph [ref=e20]: Supermart
        - paragraph [ref=e21]: supermart@example.com
    - navigation [ref=e22]:
      - paragraph [ref=e23]: Menu
      - link "Dashboard" [ref=e24] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e25]
        - generic [ref=e30]: Dashboard
      - link "Categories" [ref=e31] [cursor=pointer]:
        - /url: /categories
        - img [ref=e32]
        - generic [ref=e35]: Categories
      - link "Products" [ref=e36] [cursor=pointer]:
        - /url: /products
        - img [ref=e37]
        - generic [ref=e41]: Products
        - img [ref=e42]
      - link "Inventory" [ref=e44] [cursor=pointer]:
        - /url: /inventory
        - img [ref=e45]
        - generic [ref=e55]: Inventory
      - link "Customers" [ref=e56] [cursor=pointer]:
        - /url: /customers
        - img [ref=e57]
        - generic [ref=e62]: Customers
      - link "Sales" [ref=e63] [cursor=pointer]:
        - /url: /sales
        - img [ref=e64]
        - generic [ref=e68]: Sales
      - link "Reports" [ref=e69] [cursor=pointer]:
        - /url: /reports
        - img [ref=e70]
        - generic [ref=e72]: Reports
      - link "Settings" [ref=e73] [cursor=pointer]:
        - /url: /settings
        - img [ref=e74]
        - generic [ref=e77]: Settings
    - generic [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e81]: JD
        - generic [ref=e82]:
          - paragraph [ref=e83]: John Doe
          - paragraph [ref=e84]: owner
      - button "Sign Out" [ref=e85] [cursor=pointer]:
        - img [ref=e86]
        - generic [ref=e89]: Sign Out
  - generic [ref=e90]:
    - banner [ref=e91]:
      - generic [ref=e92]:
        - heading "Products" [level=2] [ref=e95]
        - generic [ref=e96]:
          - button [ref=e97] [cursor=pointer]:
            - img [ref=e98]
          - button [ref=e100] [cursor=pointer]:
            - img [ref=e101]
          - generic [ref=e105]:
            - generic [ref=e107]: JO
            - generic [ref=e108]:
              - paragraph [ref=e109]: John
              - paragraph [ref=e110]: owner
    - main [ref=e111]:
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e114]:
            - heading "Products" [level=1] [ref=e115]
            - paragraph [ref=e116]: Manage items in your inventory.
          - button "Add Product" [ref=e117] [cursor=pointer]:
            - img [ref=e118]
            - text: Add Product
        - generic [ref=e119]:
          - generic [ref=e120]:
            - img [ref=e121]
            - textbox "Search products by name, SKU, barcode..." [ref=e124]
          - combobox [ref=e126]:
            - option "All Categories" [selected]
            - option "Beverages"
            - option "E2E Testing Category"
            - option "Groceries"
          - combobox [ref=e128]:
            - option "All Stock Statuses" [selected]
            - option "In Stock"
            - option "Low Stock"
            - option "Out of Stock"
        - table [ref=e131]:
          - rowgroup [ref=e132]:
            - row "Product SKU Category Prices Margin Stock Actions" [ref=e133]:
              - columnheader "Product" [ref=e134]
              - columnheader "SKU" [ref=e135]
              - columnheader "Category" [ref=e136]
              - columnheader "Prices" [ref=e137]
              - columnheader "Margin" [ref=e138]
              - columnheader "Stock" [ref=e139]
              - columnheader "Actions" [ref=e140]
          - rowgroup [ref=e141]:
            - 'row "Coca Cola 1.5L pcs SM-COKE-01 Beverages Buy: Rs 120 Sell: Rs 150 25.00% 130 pcs Min: 20" [ref=e142]':
              - cell "Coca Cola 1.5L pcs" [ref=e143]:
                - img [ref=e145]
                - generic [ref=e149]:
                  - paragraph [ref=e150]: Coca Cola 1.5L
                  - paragraph [ref=e151]: pcs
              - cell "SM-COKE-01" [ref=e152]
              - cell "Beverages" [ref=e153]:
                - generic [ref=e156]: Beverages
              - 'cell "Buy: Rs 120 Sell: Rs 150" [ref=e157]':
                - generic [ref=e158]:
                  - generic [ref=e159]: "Buy: Rs 120"
                  - generic [ref=e160]: "Sell: Rs 150"
              - cell "25.00%" [ref=e161]
              - 'cell "130 pcs Min: 20" [ref=e162]':
                - generic [ref=e163]:
                  - generic [ref=e164]: 130 pcs
                  - paragraph [ref=e165]: "Min: 20"
              - cell [ref=e166]:
                - generic [ref=e167]:
                  - link "View details" [ref=e168] [cursor=pointer]:
                    - /url: /products/6a4c06bdb0184fd3a33322d6
                    - img [ref=e169]
                  - button "Edit" [ref=e172] [cursor=pointer]:
                    - img [ref=e173]
                  - button "Delete" [ref=e176] [cursor=pointer]:
                    - img [ref=e177]
            - 'row "Basmati Rice 5kg pcs SM-RICE-01 Groceries Buy: Rs 800 Sell: Rs 1,000 25.00% 50 pcs Min: 10" [ref=e180]':
              - cell "Basmati Rice 5kg pcs" [ref=e181]:
                - img [ref=e183]
                - generic [ref=e187]:
                  - paragraph [ref=e188]: Basmati Rice 5kg
                  - paragraph [ref=e189]: pcs
              - cell "SM-RICE-01" [ref=e190]
              - cell "Groceries" [ref=e191]:
                - generic [ref=e194]: Groceries
              - 'cell "Buy: Rs 800 Sell: Rs 1,000" [ref=e195]':
                - generic [ref=e196]:
                  - generic [ref=e197]: "Buy: Rs 800"
                  - generic [ref=e198]: "Sell: Rs 1,000"
              - cell "25.00%" [ref=e199]
              - 'cell "50 pcs Min: 10" [ref=e200]':
                - generic [ref=e201]:
                  - generic [ref=e202]: 50 pcs
                  - paragraph [ref=e203]: "Min: 10"
              - cell [ref=e204]:
                - generic [ref=e205]:
                  - link "View details" [ref=e206] [cursor=pointer]:
                    - /url: /products/6a4c06bdb0184fd3a33322d4
                    - img [ref=e207]
                  - button "Edit" [ref=e210] [cursor=pointer]:
                    - img [ref=e211]
                  - button "Delete" [ref=e214] [cursor=pointer]:
                    - img [ref=e215]
        - generic [ref=e219]:
          - heading "New Product" [level=2] [ref=e220]
          - generic [ref=e221]:
            - generic [ref=e222]:
              - generic [ref=e223]:
                - generic [ref=e224]: Name *
                - textbox "Product name" [active] [ref=e225]: Playwright Test Product
              - generic [ref=e226]:
                - generic [ref=e227]: Category *
                - combobox [ref=e228]:
                  - option "Select Category" [selected]
                  - option "Beverages"
                  - option "E2E Testing Category"
                  - option "Groceries"
              - generic [ref=e229]:
                - generic [ref=e230]: Unit
                - combobox [ref=e231]:
                  - option "pcs" [selected]
                  - option "kg"
                  - option "g"
                  - option "ltr"
                  - option "ml"
                  - option "box"
                  - option "pack"
                  - option "dozen"
                  - option "set"
                  - option "pair"
                  - option "roll"
                  - option "m"
                  - option "ft"
              - generic [ref=e232]:
                - generic [ref=e233]: Buying Price *
                - spinbutton [ref=e234]: "0"
              - generic [ref=e235]:
                - generic [ref=e236]: Selling Price *
                - spinbutton [ref=e237]: "0"
              - generic [ref=e238]:
                - generic [ref=e239]: Current Stock
                - spinbutton [ref=e240]: "0"
              - generic [ref=e241]:
                - generic [ref=e242]: Minimum Stock Alert
                - spinbutton [ref=e243]: "10"
              - generic [ref=e244]:
                - generic [ref=e245]: Barcode / SKU Prefix
                - textbox "EAN, UPC, or custom" [ref=e246]
            - generic [ref=e247]:
              - generic [ref=e248]: Description
              - textbox "Product description (optional)" [ref=e249]
            - generic [ref=e250]:
              - generic [ref=e251]: Product Images
              - button "Choose File" [ref=e252] [cursor=pointer]
            - generic [ref=e253]:
              - button "Cancel" [ref=e254] [cursor=pointer]
              - button "Create" [ref=e255] [cursor=pointer]
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
  15 |     await this.page.click("button:has-text(\"Add Product\")");
  16 |     await this.page.fill("input[placeholder=\"Product name\"]", name);
> 17 |     await this.page.locator("div:has(label:has-text(\"Category\")) >> select").selectOption({ label: category });
     |                                                                                ^ Error: locator.selectOption: Error: strict mode violation: locator('div:has(label:has-text("Category"))').locator('select') resolved to 4 elements:
  18 |     await this.page.locator("div:has(label:has-text(\"Unit\")) >> select").selectOption({ label: unit });
  19 |     await this.page.fill("input[placeholder=\"Buying price\"]", buyingPrice.toString());
  20 |     await this.page.fill("input[placeholder=\"Selling price\"]", sellingPrice.toString());
  21 |     await this.page.fill("input[placeholder=\"Min alert stock\"]", minimumStock.toString());
  22 |     await this.page.fill("input[placeholder=\"EAN, UPC, or custom\"]", barcode);
  23 |     await this.page.fill("textarea[placeholder=\"Product description (optional)\"]", description);
  24 |     await this.page.click("button[type=\"submit\"]:has-text(\"Create\")");
  25 |   }
  26 | 
  27 |   async verifyProductInList(name: string) {
  28 |     await expect(this.page.locator(`td:has-text("${name}")`).first()).toBeVisible();
  29 |   }
  30 | }
  31 | 
```