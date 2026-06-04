import { test, expect } from '@playwright/test';

test('has title and customer portal loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Meridian Airways')).toBeVisible();
  await expect(page.getByText('Where would you like to go?')).toBeVisible();
});

test('ops dashboard loads and shows active flights', async ({ page }) => {
  await page.goto('/ops');
  await expect(page.getByText('Airline Operations Center')).toBeVisible();
  await expect(page.getByText('Total Flights (Active)')).toBeVisible();
  await expect(page.getByText('Live Flight Status')).toBeVisible();
});

test('supervisor console loads', async ({ page }) => {
  await page.goto('/supervisor');
  await expect(page.getByText('Supervisor Console')).toBeVisible();
});

test('ai agent center loads', async ({ page }) => {
  await page.goto('/ai-agents');
  await expect(page.getByText('AI Agent Control Center')).toBeVisible();
  await expect(page.getByText('Active Workflow: Refund Processing')).toBeVisible();
});

test('aiops console loads', async ({ page }) => {
  await page.goto('/ai-ops');
  await expect(page.getByText('AIOps Agent Console')).toBeVisible();
  await expect(page.getByText('Simulate External Agent Command')).toBeVisible();
});
