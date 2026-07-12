import { expect, test } from 'playwright/test';

const progressStorageKey = 'anycast-guide:lab-first-experiment:v1';

test('embeds the local-first workspace directly in the follow-along guide', async ({ page }) => {
  await page.goto('/lab/about/');

  const followAlong = page.getByRole('region', { name: 'Anycast Lab follow-along' });
  await expect(followAlong).toBeVisible();

  const frame = followAlong.getByTitle('Anycast Lab follow-along workspace');
  await expect(frame).toHaveAttribute('src', '/lab/?embed=guide');
  await expect(followAlong.getByRole('link', { name: 'Open full workspace' })).toHaveAttribute('href', '/lab/');

  const workspace = page.frameLocator('iframe[title="Anycast Lab follow-along workspace"]');
  await expect(workspace.getByTestId('topology-canvas')).toBeVisible();
  await expect(workspace.getByRole('button', { name: 'Expand appliance palette' })).toBeVisible();
  await expect(workspace.getByRole('button', { name: 'Expand details panel' })).toBeVisible();

  const serifOffenders = await followAlong.evaluate((region) => (
    [region, ...region.querySelectorAll<HTMLElement>('*')]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((element) => getComputedStyle(element).fontFamily.toLowerCase())
      .filter((family) => family.split(',').some((token) => (
        ['serif', 'times', 'times new roman', 'georgia', 'cambria']
          .includes(token.trim().replace(/^['"]|['"]$/g, ''))
      )))
  ));
  expect(serifOffenders).toEqual([]);
});

test('persists follow-along progress locally and can reset it', async ({ page }) => {
  await page.goto('/lab/about/');

  const followAlong = page.getByRole('region', { name: 'Anycast Lab follow-along' });
  const steps = followAlong.getByRole('checkbox');
  await expect(steps).toHaveCount(6);
  await expect(followAlong.getByText('0 of 6 complete')).toBeVisible();

  await steps.nth(0).check();
  await steps.nth(3).check();
  await expect(followAlong.getByText('2 of 6 complete')).toBeVisible();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), progressStorageKey)).not.toBeNull();

  await page.reload();
  const restored = page.getByRole('region', { name: 'Anycast Lab follow-along' });
  await expect(restored.getByText('2 of 6 complete')).toBeVisible();
  await expect(restored.getByRole('checkbox').nth(0)).toBeChecked();
  await expect(restored.getByRole('checkbox').nth(3)).toBeChecked();

  await restored.getByRole('button', { name: 'Reset progress' }).click();
  await expect(restored.getByText('0 of 6 complete')).toBeVisible();
  for (const step of await restored.getByRole('checkbox').all()) {
    await expect(step).not.toBeChecked();
  }
});

test('steers the embedded workspace from the follow-along steps', async ({ page }) => {
  await page.goto('/lab/about/');

  const followAlong = page.getByRole('region', { name: 'Anycast Lab follow-along' });
  const workspace = page.frameLocator('iframe[title="Anycast Lab follow-along workspace"]');
  const labShell = workspace.locator('.lab-shell');
  await expect(workspace.getByTestId('topology-canvas')).toBeVisible();
  await expect(workspace.getByRole('button', { name: 'Expand workspace toolbar' })).toBeVisible();

  const showRuntime = followAlong.getByRole('button', { name: 'Show Choose the fidelity in lab' });
  await showRuntime.click();
  await expect(showRuntime).toHaveAttribute('aria-current', 'step');
  await expect(labShell).toHaveAttribute('data-guide-focus', 'runtime');
  await expect(workspace.getByRole('button', { name: 'Collapse workspace toolbar' })).toBeVisible();
  await expect(workspace.getByRole('radiogroup', { name: 'Runtime mode' })).toBeVisible();

  const showTrace = followAlong.getByRole('button', { name: 'Show Trace the anycast address in lab' });
  await showTrace.click();
  await expect(showTrace).toHaveAttribute('aria-current', 'step');
  await expect(showRuntime).not.toHaveAttribute('aria-current', 'step');
  await expect(labShell).toHaveAttribute('data-guide-focus', 'trace');
});

test('keeps the follow-along workspace usable at the 1024px guide breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/lab/about/');

  const followAlong = page.getByRole('region', { name: 'Anycast Lab follow-along' });
  const frame = followAlong.locator('.lab-follow-along__frame');
  const lesson = followAlong.locator('.lab-follow-along__lesson');
  await expect(frame).toBeVisible();
  await expect(lesson).toBeVisible();

  const layout = await followAlong.evaluate((region) => {
    const frame = region.querySelector<HTMLElement>('.lab-follow-along__frame');
    const lesson = region.querySelector<HTMLElement>('.lab-follow-along__lesson');
    if (!frame || !lesson) throw new Error('Expected the follow-along frame and lesson');
    const frameBounds = frame.getBoundingClientRect();
    const lessonBounds = lesson.getBoundingClientRect();
    return {
      frameWidth: frameBounds.width,
      stacked: lessonBounds.top >= frameBounds.bottom - 1,
    };
  });

  expect(
    layout.stacked || layout.frameWidth > 500,
    `Expected a stacked follow-along or a frame wider than 500px, got ${layout.frameWidth}px`,
  ).toBe(true);
});

test('keeps guide navigation outside the lab service worker cache and offline shell fallback', async ({ page, context }) => {
  await page.goto('/lab/');
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '')).toContain('/lab/sw.js');

  await page.goto('/lab/about/');
  await expect(page.getByRole('region', { name: 'Anycast Lab follow-along' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '')).toContain('/lab/sw.js');

  const cacheAudit = await page.evaluate(async () => {
    const guideUrl = window.location.href;
    const appRootUrl = new URL('/lab/', window.location.origin).href;
    let guideEntries = 0;
    let appRootContainsGuide = false;
    for (const cacheName of await caches.keys()) {
      if (!cacheName.startsWith('anycast-lab-')) continue;
      const cache = await caches.open(cacheName);
      if (await cache.match(guideUrl, { ignoreVary: true })) guideEntries += 1;
      const appRoot = await cache.match(appRootUrl, { ignoreVary: true });
      if (appRoot && (await appRoot.text()).includes('data-lab-follow-along')) {
        appRootContainsGuide = true;
      }
    }
    return { guideEntries, appRootContainsGuide };
  });
  expect(cacheAudit).toEqual({ guideEntries: 0, appRootContainsGuide: false });

  try {
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10_000 }).catch(() => null);
    expect(new URL(page.url()).pathname).toBe('/lab/about/');
    await expect(page.locator('.lab-shell')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveCount(0);
  } finally {
    await context.setOffline(false);
  }
});
