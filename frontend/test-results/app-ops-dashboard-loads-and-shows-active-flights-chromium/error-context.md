# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> ops dashboard loads and shows active flights
- Location: e2e\app.spec.ts:9:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Airline Operations Center')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Airline Operations Center')

```

```yaml
- banner:
  - link "Meridian Airways":
    - /url: /
  - link "Book":
    - /url: /
  - link "Operations":
    - /url: /ops
  - link "Supervisor":
    - /url: /supervisor
  - link "AI Agents":
    - /url: /ai-agents
  - link "AIOps":
    - /url: /ai-ops
- main:
  - heading "Operations Center" [level=4]
  - paragraph: Live flight monitoring and status overview
  - heading "0" [level=4]
  - paragraph: Total Flights
  - heading "0" [level=4]
  - paragraph: On Schedule
  - heading "0" [level=4]
  - paragraph: Delayed
  - heading "0" [level=4]
  - paragraph: Cancelled
  - heading "Live Flight Board" [level=6]
  - table:
    - rowgroup:
      - row "Flight Route Departure Arrival Aircraft Status":
        - columnheader "Flight"
        - columnheader "Route"
        - columnheader "Departure"
        - columnheader "Arrival"
        - columnheader "Aircraft"
        - columnheader "Status"
    - rowgroup
- contentinfo:
  - paragraph: Meridian Airways
  - link "Privacy Policy":
    - /url: "#"
  - link "Terms":
    - /url: "#"
  - link "Baggage":
    - /url: "#"
  - link "Contact":
    - /url: "#"
  - separator
  - text: © 2026 Meridian Airways — Demo Platform. All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title and customer portal loads', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   await expect(page.getByText('Meridian Airways')).toBeVisible();
  6  |   await expect(page.getByText('Where would you like to go?')).toBeVisible();
  7  | });
  8  | 
  9  | test('ops dashboard loads and shows active flights', async ({ page }) => {
  10 |   await page.goto('/ops');
> 11 |   await expect(page.getByText('Airline Operations Center')).toBeVisible();
     |                                                             ^ Error: expect(locator).toBeVisible() failed
  12 |   await expect(page.getByText('Total Flights (Active)')).toBeVisible();
  13 |   await expect(page.getByText('Live Flight Status')).toBeVisible();
  14 | });
  15 | 
  16 | test('supervisor console loads', async ({ page }) => {
  17 |   await page.goto('/supervisor');
  18 |   await expect(page.getByText('Supervisor Console')).toBeVisible();
  19 | });
  20 | 
  21 | test('ai agent center loads', async ({ page }) => {
  22 |   await page.goto('/ai-agents');
  23 |   await expect(page.getByText('AI Agent Control Center')).toBeVisible();
  24 |   await expect(page.getByText('Active Workflow: Refund Processing')).toBeVisible();
  25 | });
  26 | 
  27 | test('aiops console loads', async ({ page }) => {
  28 |   await page.goto('/ai-ops');
  29 |   await expect(page.getByText('AIOps Agent Console')).toBeVisible();
  30 |   await expect(page.getByText('Simulate External Agent Command')).toBeVisible();
  31 | });
  32 | 
```