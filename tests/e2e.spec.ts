import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.on('console', (message) => console.log(message.text()));
});

test('html sdk installation', async ({ page, userAgent }) => {
  const requestListener = page.waitForRequest((req) => req.url().indexOf('/api/rum/events') > -1, {
    timeout: 5000,
  });

  await page.goto('/basic.html', { waitUntil: 'load' });

  await expect(page).toHaveTitle('Cronitor RUM Test');

  let result = await page.evaluate(() => typeof window.cronitor === 'function');
  expect(result).toBe(true);

  result = await page.evaluate(() => typeof window.cronitor.q === 'object');
  expect(result).toBe(true);

  const request = await requestListener;
  expect(request.method()).toBe('POST');
  expect(request.postDataJSON().client_key).toBe('YOUR_CLIENT_KEY');
  expect(request.postDataJSON().event_name).toBe('Pageview');
  expect(request.postDataJSON().url).toBe('http://localhost/basic.html');
  expect(request.postDataJSON().user_agent).toBe(userAgent);
});

test('sdk misconfigured - skip event collection', async ({ page }) => {
  let requestWasMade = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/rum/events')) {
      requestWasMade = true;
    }
  });

  await page.goto('/misconfigured.html', { waitUntil: 'load' });

  await expect(page).toHaveTitle('Cronitor RUM Test');

  let result = await page.evaluate(() => typeof window.cronitor === 'function');
  expect(result).toBe(true);

  result = await page.evaluate(() => typeof window.cronitor.q === 'object');
  expect(result).toBe(true);

  expect(requestWasMade).toBe(false);
});

test('disable autotrack - skip event collection', async ({ page }) => {
  let requestWasMade = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/rum/events')) {
      requestWasMade = true;
    }
  });

  await page.goto('/autotrack-disabled.html', { waitUntil: 'load' });
  await page.waitForTimeout(5000);

  expect(requestWasMade).toBe(false);
});

test('core web vitals - records first input delay', async ({ page, browserName }) => {
  // Skip this test on webkit
  if (browserName === 'webkit') {
    return;
  }

  const requestListener = page.waitForRequest(
    (req) => {
      return req.url().indexOf('/api/rum/events') > -1 && typeof req.postDataJSON().web_vital_fid === 'number';
    },
    {
      timeout: 10000,
    },
  );

  await page.goto('/core-web-vitals.html', { waitUntil: 'load' });

  // Trigger FID core web vital
  await page.waitForTimeout(1000);
  await page.click('#click-me');

  const request = await requestListener;
  expect(request.postDataJSON().event_name).toBe('WebVital');
  expect(typeof request.postDataJSON().web_vital_fid === 'number').toBe(true);
});

test('error tracking - listens for uncaught errors', async ({ page, browserName }) => {
  const requestListener = page.waitForRequest(
    (req) => {
      return req.url().indexOf('/api/rum/events') > -1 && req.postDataJSON().event_name === 'Error';
    },
    {
      timeout: 10000,
    },
  );

  await page.goto('/error-tracking.html', { waitUntil: 'load' });

  // Trigger FID core web vital
  await page.waitForTimeout(1000);
  await page.click('#click-me');

  const request = await requestListener;
  expect(request.postDataJSON().event_name).toBe('Error');
  expect(request.postDataJSON().error_type).toBe('ReferenceError');
  expect(request.postDataJSON().filename).toBe('http://localhost:8888/error-tracking.html');

  // browsers report error values differently
  if (browserName === 'webkit') {
    expect(request.postDataJSON().message).toBe("Can't find variable: abc");
    expect(request.postDataJSON().lineno).toBe(16);
    expect(request.postDataJSON().colno).toBe(6);
  } else if (browserName === 'firefox') {
    expect(request.postDataJSON().message).toBe('abc is not defined');
    expect(request.postDataJSON().lineno).toBe(1);
    expect(request.postDataJSON().colno).toBe(1);
  } else {
    expect(request.postDataJSON().message).toBe('abc is not defined');
    expect(request.postDataJSON().lineno).toBe(16);
    expect(request.postDataJSON().colno).toBe(40);
  }
});
