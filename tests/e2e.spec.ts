import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route(/api\/rum\/events$/, (route) => {
    route.fulfill({ status: 200, body: 'OK' });
  });
});

test('basic', async ({ page }) => {
  const triggeredEvent = page.waitForRequest('http://localhost:8888/api/rum/events', { timeout: 5000 });
  await page.goto('http://localhost:8888/basic.html');

  await expect(page).toHaveTitle('Cronitor RUM Test');

  let result = await page.evaluate(() => typeof window.cronitor === 'function');
  expect(result).toBeTruthy();

  result = await page.evaluate(() => typeof window.cronitor.q === 'object');
  expect(result).toBeTruthy();

  const request = await triggeredEvent;
  expect(request.method()).toBe('POST');
  // expect(request.postDataJSON().client_key).toBe('YOUR_CLIENT_KEY');
  // expect(request.postDataJSON().event_name).toBe('Pageview');
  // expect(request.postDataJSON().url).toBe('http://localhost:8888/basic.html');
  // expect(request.postDataJSON().user_agent).toBeTruthy();
});
