# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> aiops console loads
- Location: e2e\app.spec.ts:27:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Simulate External Agent Command')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Simulate External Agent Command')

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
  - heading "AIOps Agent Console" [level=4]
  - paragraph: Monitor agent reasoning, tool calls, policy evaluations, and decisions in real-time
  - text: ● LIVE
  - heading "Audit Trail" [level=6]
  - button "↻ Refresh"
  - paragraph: No audit records found.
  - textbox "Enter natural language command e.g. \"Refund booking PNR002\""
  - button
  - heading "Sample Commands" [level=6]
  - text: "> Refund booking PNR002 > Check eligibility for PNR005 > Show audit trail for booking #3 > Approve refund for PNR001 > What is the fraud risk for PNR004?"
  - heading "Activity Summary" [level=6]
  - paragraph: Total Log Entries
  - paragraph: "0"
  - paragraph: Unique Agents
  - paragraph: "0"
  - paragraph: Auto-Approved
  - paragraph: "0"
  - paragraph: Escalations
  - paragraph: "0"
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
  11 |   await expect(page.getByText('Airline Operations Center')).toBeVisible();
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
> 30 |   await expect(page.getByText('Simulate External Agent Command')).toBeVisible();
     |                                                                   ^ Error: expect(locator).toBeVisible() failed
  31 | });
  32 | 
```