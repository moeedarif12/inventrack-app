# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: business.spec.ts >> Business Profile Settings >> should update business info successfully
- Location: specs\business.spec.ts:13:7

# Error details

```
Error: locator.fill: Error: strict mode violation: locator('div:has(label:has-text("Business Name"))').locator('input') resolved to 10 elements:
    1) <input type="file" accept="image/*" class="block w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"/> aka getByRole('button', { name: 'Choose File' })
    2) <input required="" value="Supermart" class="form-input"/> aka getByRole('textbox').first()
    3) <input required="" type="email" class="form-input" value="supermart@example.com"/> aka locator('input[type="email"]')
    4) <input class="form-input" value="03001234567"/> aka getByRole('textbox').nth(2)
    5) <input class="form-input" value="www.supermart.com" placeholder="e.g. www.store.com"/> aka getByRole('textbox', { name: 'e.g. www.store.com' })
    6) <input min="0" max="100" value="5" type="number" class="form-input"/> aka getByRole('spinbutton').first()
    7) <input min="0" value="15" type="number" class="form-input"/> aka getByRole('spinbutton').nth(1)
    8) <input value="SKU" class="form-input"/> aka getByRole('textbox').nth(5)
    9) <input value="INV" class="form-input"/> aka getByRole('textbox').filter({ hasText: /^$/ }).nth(5)
    10) <input type="checkbox" class="w-5 h-5 accent-primary border-border focus:ring-primary rounded"/> aka getByRole('checkbox')

Call log:
  - waiting for locator('div:has(label:has-text("Business Name"))').locator('input')

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
      - link "Inventory" [ref=e42] [cursor=pointer]:
        - /url: /inventory
        - img [ref=e43]
        - generic [ref=e53]: Inventory
      - link "Customers" [ref=e54] [cursor=pointer]:
        - /url: /customers
        - img [ref=e55]
        - generic [ref=e60]: Customers
      - link "Sales" [ref=e61] [cursor=pointer]:
        - /url: /sales
        - img [ref=e62]
        - generic [ref=e66]: Sales
      - link "Reports" [ref=e67] [cursor=pointer]:
        - /url: /reports
        - img [ref=e68]
        - generic [ref=e70]: Reports
      - link "Settings" [ref=e71] [cursor=pointer]:
        - /url: /settings
        - img [ref=e72]
        - generic [ref=e75]: Settings
        - img [ref=e76]
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
        - heading "Settings" [level=2] [ref=e95]
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
          - heading "Settings" [level=1] [ref=e114]:
            - img [ref=e115]
            - text: Settings
          - paragraph [ref=e118]: Control your profile preferences and business configurations.
        - generic [ref=e119]:
          - button "My Profile" [ref=e120] [cursor=pointer]:
            - img [ref=e121]
            - text: My Profile
          - button "Business Profile" [active] [ref=e124] [cursor=pointer]:
            - img [ref=e125]
            - text: Business Profile
          - button "Password & Security" [ref=e128] [cursor=pointer]:
            - img [ref=e129]
            - text: Password & Security
        - generic [ref=e132]:
          - generic [ref=e133]:
            - img [ref=e135]
            - generic [ref=e138]:
              - generic [ref=e139]: Business Logo
              - button "Choose File" [ref=e140] [cursor=pointer]
          - generic [ref=e141]:
            - generic [ref=e142]:
              - heading "General Info" [level=3] [ref=e143]:
                - img [ref=e144]
                - text: General Info
              - generic [ref=e147]:
                - generic [ref=e148]: Business Name *
                - textbox [ref=e149]: Supermart
              - generic [ref=e150]:
                - generic [ref=e151]: Email Address *
                - textbox [ref=e152]: supermart@example.com
              - generic [ref=e153]:
                - generic [ref=e154]: Phone Number
                - textbox [ref=e155]: "03001234567"
              - generic [ref=e156]:
                - generic [ref=e157]: Website URL
                - textbox "e.g. www.store.com" [ref=e158]: www.supermart.com
              - generic [ref=e159]:
                - generic [ref=e160]: Description
                - textbox "Brief summary..." [ref=e161]: Your friendly neighborhood grocery store.
            - generic [ref=e162]:
              - heading "Preferences" [level=3] [ref=e163]:
                - img [ref=e164]
                - text: Preferences
              - generic [ref=e167]:
                - generic [ref=e168]: Base Currency
                - combobox [ref=e169]:
                  - option "PKR" [selected]
                  - option "USD"
                  - option "EUR"
                  - option "GBP"
                  - option "AED"
                  - option "SAR"
                  - option "INR"
              - generic [ref=e170]:
                - generic [ref=e171]: Standard GST / Tax Rate (%)
                - spinbutton [ref=e172]: "5"
              - generic [ref=e173]:
                - generic [ref=e174]: Low Stock Warning Threshold
                - spinbutton [ref=e175]: "15"
              - generic [ref=e176]:
                - generic [ref=e177]: SKU Auto-generation Prefix
                - textbox [ref=e178]: SKU
              - generic [ref=e179]:
                - generic [ref=e180]: Invoice Number Prefix
                - textbox [ref=e181]: INV
              - generic [ref=e182]:
                - generic [ref=e183]:
                  - paragraph [ref=e184]: Allow Negative Stock Checkout
                  - paragraph [ref=e185]: Let sales continue even when items are out of stock.
                - checkbox [ref=e186]
          - button "Save Settings" [ref=e188] [cursor=pointer]
```

# Test source

```ts
  1  | import { Page, expect } from "@playwright/test";
  2  | 
  3  | export class SettingsPage {
  4  |   readonly page: Page;
  5  | 
  6  |   constructor(page: Page) {
  7  |     this.page = page;
  8  |   }
  9  | 
  10 |   async navigate() {
  11 |     await this.page.goto("/settings");
  12 |   }
  13 | 
  14 |   async updateBusinessProfile(name: string, taxRate: number) {
  15 |     await this.page.click("button:has-text(\"Business Profile\")");
> 16 |     await this.page.locator("div:has(label:has-text(\"Business Name\")) >> input").fill(name);
     |                                                                                    ^ Error: locator.fill: Error: strict mode violation: locator('div:has(label:has-text("Business Name"))').locator('input') resolved to 10 elements:
  17 |     await this.page.locator("div:has(label:has-text(\"Standard GST\")) >> input").fill(taxRate.toString());
  18 |     await this.page.click("button[type=\"submit\"]:has-text(\"Save Settings\")");
  19 |   }
  20 | }
  21 | 
```