# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> ai agent center loads
- Location: e2e\app.spec.ts:21:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Active Workflow: Refund Processing')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Active Workflow: Refund Processing')

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
  - heading "AI Agent Control Center" [level=4]
  - paragraph: Live observation of multi-agent AI workflows resolving airline service requests
  - heading "Demo Scenarios" [level=6]
  - paragraph: Economy Flex — Auto Refund
  - text: PNR001 · Economy Flex
  - paragraph: Business Class — Human Approval
  - text: PNR002 · Business Class
  - paragraph: Flight Cancelled — Auto Approved
  - text: PNR003 · Economy Saver
  - paragraph: Fraud Risk — Manual Review
  - text: PNR004 · Economy Flex
  - paragraph: Medical Emergency — Exception
  - text: PNR005 · Economy Saver
  - heading "Agent Capabilities" [level=6]
  - text: Booking Agent Retrieves booking, itinerary & profile Policy Agent Applies refund rules per fare class Eligibility Agent Calculates refund & fees Risk Agent Computes fraud score Approval Agent Routes to human if needed Notification Agent Sends email & SMS updates
  - heading "Active Workflow — Economy Flex — Auto Refund" [level=6]
  - text: "Customer: John Doe · Economy Flex · Refund: $350 Simulated Customer Request"
  - paragraph: "\"I need a refund for booking PNR001.\""
  - list:
    - listitem:
      - paragraph: Booking Agent
      - text: — Retrieve Booking
    - listitem:
      - paragraph: Policy Agent
      - text: — Retrieve Policy
    - listitem:
      - paragraph: Eligibility Agent
      - text: — Evaluate Eligibility
    - listitem:
      - paragraph: Risk Agent
      - text: — Risk Assessment
    - listitem:
      - paragraph: Approval Agent
      - text: — Approval Decision
    - listitem:
      - paragraph: Notification Agent
      - text: — Customer Notified
  - separator
  - text: Final Outcome
  - paragraph: Auto-Approved & Processed
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
> 24 |   await expect(page.getByText('Active Workflow: Refund Processing')).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  25 | });
  26 | 
  27 | test('aiops console loads', async ({ page }) => {
  28 |   await page.goto('/ai-ops');
  29 |   await expect(page.getByText('AIOps Agent Console')).toBeVisible();
  30 |   await expect(page.getByText('Simulate External Agent Command')).toBeVisible();
  31 | });
  32 | 
```