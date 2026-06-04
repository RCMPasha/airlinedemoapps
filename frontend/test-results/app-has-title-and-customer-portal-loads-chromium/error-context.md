# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> has title and customer portal loads
- Location: e2e\app.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Meridian Airways')
Expected: visible
Error: strict mode violation: getByText('Meridian Airways') resolved to 5 elements:
    1) <a href="/" data-discover="true" class="MuiTypography-root MuiTypography-h6 css-1v75v53-MuiTypography-root">Meridian Airways</a> aka getByRole('link', { name: 'Meridian Airways' })
    2) <h6 class="MuiTypography-root MuiTypography-h6 css-2l880r-MuiTypography-root">Premium flights worldwide. Powered by Meridian Ai…</h6> aka getByRole('heading', { name: 'Premium flights worldwide.' })
    3) <h5 mb="3" font-weight="700" class="MuiTypography-root MuiTypography-h5 css-1mmyfh0-MuiTypography-root">Why Fly Meridian Airways?</h5> aka getByRole('heading', { name: 'Why Fly Meridian Airways?' })
    4) <p class="MuiTypography-root MuiTypography-body2 css-q0czy6-MuiTypography-root">Meridian Airways</p> aka getByRole('paragraph').filter({ hasText: 'Meridian Airways' })
    5) <span class="MuiTypography-root MuiTypography-caption css-15ooor8-MuiTypography-root">© 2026 Meridian Airways — Demo Platform. All righ…</span> aka getByText('© 2026 Meridian Airways —')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Meridian Airways')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e6]
      - link "Meridian Airways" [ref=e8] [cursor=pointer]:
        - /url: /
      - generic [ref=e9]:
        - link "Book" [ref=e10] [cursor=pointer]:
          - /url: /
        - link "Operations" [ref=e11] [cursor=pointer]:
          - /url: /ops
        - link "Supervisor" [ref=e12] [cursor=pointer]:
          - /url: /supervisor
        - link "AI Agents" [ref=e13] [cursor=pointer]:
          - /url: /ai-agents
        - link "AIOps" [ref=e14] [cursor=pointer]:
          - /url: /ai-ops
  - main [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e19]:
          - heading "Elevate Your Journey" [level=2] [ref=e20]
          - heading "Premium flights worldwide. Powered by Meridian Airways." [level=6] [ref=e21]
        - generic [ref=e23]:
          - group [ref=e25]:
            - button "One Way" [pressed] [ref=e26] [cursor=pointer]
            - button "Return" [ref=e27] [cursor=pointer]
            - button "Multi-City" [ref=e28] [cursor=pointer]
          - generic [ref=e30]:
            - generic [ref=e32]:
              - generic: From
              - generic [ref=e33]:
                - textbox "From" [ref=e34]:
                  - /placeholder: City or Airport
                - group:
                  - generic: From
            - img [ref=e37] [cursor=pointer]
            - generic [ref=e40]:
              - generic: To
              - generic [ref=e41]:
                - textbox "To" [ref=e42]:
                  - /placeholder: City or Airport
                - group:
                  - generic: To
            - generic [ref=e44]:
              - generic: Departure
              - generic [ref=e45]:
                - textbox "Departure" [ref=e46]
                - group:
                  - generic: Departure
            - generic [ref=e48]:
              - generic [ref=e49]: Passengers
              - generic [ref=e50]:
                - combobox "Passengers" [ref=e51] [cursor=pointer]: 1 Pax
                - textbox: "1"
                - img
                - group:
                  - generic: Passengers
            - generic [ref=e53]:
              - generic: Class
              - generic [ref=e54]:
                - combobox "Class" [ref=e55] [cursor=pointer]
                - textbox
                - img
                - group:
                  - generic: Class
            - button "Search" [ref=e57] [cursor=pointer]:
              - img [ref=e59]
              - text: Search
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e64]:
            - heading "Popular Routes" [level=5] [ref=e65]
            - paragraph [ref=e66]: Click to instantly find available flights
          - generic [ref=e67]:
            - generic [ref=e70] [cursor=pointer]:
              - generic [ref=e71]: ✈️
              - generic [ref=e72]:
                - paragraph [ref=e73]: Dubai → London
                - text: from $420
              - generic [ref=e74]:
                - generic [ref=e76]: DXB
                - generic [ref=e78]: LHR
            - generic [ref=e81] [cursor=pointer]:
              - generic [ref=e82]: 🗽
              - generic [ref=e83]:
                - paragraph [ref=e84]: Dubai → New York
                - text: from $488
              - generic [ref=e85]:
                - generic [ref=e87]: DXB
                - generic [ref=e89]: JFK
            - generic [ref=e92] [cursor=pointer]:
              - generic [ref=e93]: 🦘
              - generic [ref=e94]:
                - paragraph [ref=e95]: Singapore → Sydney
                - text: from $310
              - generic [ref=e96]:
                - generic [ref=e98]: SIN
                - generic [ref=e100]: SYD
            - generic [ref=e103] [cursor=pointer]:
              - generic [ref=e104]: 🗼
              - generic [ref=e105]:
                - paragraph [ref=e106]: Paris → Frankfurt
                - text: from $150
              - generic [ref=e107]:
                - generic [ref=e109]: CDG
                - generic [ref=e111]: FRA
            - generic [ref=e114] [cursor=pointer]:
              - generic [ref=e115]: 🗾
              - generic [ref=e116]:
                - paragraph [ref=e117]: Tokyo → Dubai
                - text: from $199
              - generic [ref=e118]:
                - generic [ref=e120]: NRT
                - generic [ref=e122]: DXB
            - generic [ref=e125] [cursor=pointer]:
              - generic [ref=e126]: 🎡
              - generic [ref=e127]:
                - paragraph [ref=e128]: London → New York
                - text: from $380
              - generic [ref=e129]:
                - generic [ref=e131]: LHR
                - generic [ref=e133]: JFK
        - generic [ref=e135]:
          - heading "✨ Featured Flights" [level=5] [ref=e136]
          - paragraph [ref=e137]: Hand-picked flights for top destinations
        - generic [ref=e138]:
          - heading "Why Fly Meridian Airways?" [level=5] [ref=e139]
          - generic [ref=e140]:
            - generic [ref=e143]:
              - paragraph [ref=e144]: 🌍
              - heading "Global Network" [level=6] [ref=e145]
              - paragraph [ref=e146]: 120+ destinations across 6 continents with seamless connections.
            - generic [ref=e149]:
              - paragraph [ref=e150]: 💺
              - heading "Luxury Cabins" [level=6] [ref=e151]
              - paragraph [ref=e152]: Award-winning First Class and Business suites with lie-flat beds.
            - generic [ref=e155]:
              - paragraph [ref=e156]: 🤖
              - heading "AI-Powered Service" [level=6] [ref=e157]
              - paragraph [ref=e158]: Our Agentic AI resolves refunds, rebooking and queries in seconds.
            - generic [ref=e161]:
              - paragraph [ref=e162]: 🎁
              - heading "Meridian Miles" [level=6] [ref=e163]
              - paragraph [ref=e164]: Earn and redeem miles on every flight. Platinum status fast-tracked.
  - contentinfo [ref=e165]:
    - generic [ref=e166]:
      - generic [ref=e167]:
        - generic [ref=e168]:
          - img [ref=e169]
          - paragraph [ref=e171]: Meridian Airways
        - generic [ref=e172]:
          - link "Privacy Policy" [ref=e173] [cursor=pointer]:
            - /url: "#"
          - link "Terms" [ref=e174] [cursor=pointer]:
            - /url: "#"
          - link "Baggage" [ref=e175] [cursor=pointer]:
            - /url: "#"
          - link "Contact" [ref=e176] [cursor=pointer]:
            - /url: "#"
        - generic [ref=e177]:
          - img [ref=e178] [cursor=pointer]
          - img [ref=e180] [cursor=pointer]
          - img [ref=e182] [cursor=pointer]
          - img [ref=e184] [cursor=pointer]
      - separator [ref=e186]
      - generic [ref=e187]: © 2026 Meridian Airways — Demo Platform. All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title and customer portal loads', async ({ page }) => {
  4  |   await page.goto('/');
> 5  |   await expect(page.getByText('Meridian Airways')).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
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
  30 |   await expect(page.getByText('Simulate External Agent Command')).toBeVisible();
  31 | });
  32 | 
```