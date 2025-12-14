const test = require('node:test');
const assert = require('node:assert/strict');

const puppeteer = require('puppeteer');

const { buildE2EExamples, distDir } = require('./utils/build-examples');
const { startE2EServer } = require('./utils/server');

let server;
let baseUrl;
let browser;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getBox(page, selector) {
  return page.$eval(selector, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
}

async function waitForE2EReady(page) {
  await page.waitForFunction(() => window.__E2E__ && window.__E2E__.ready === true);
}

test.before(async () => {
  await buildE2EExamples();
  server = await startE2EServer({ distDir });
  baseUrl = server.baseUrl;

  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
});

test.after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
});

test('window-basic: open, drag, minimize/maximize, close', async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    await page.goto(`${baseUrl}/window-basic`, { waitUntil: 'load' });
    await waitForE2EReady(page);

    await page.waitForSelector('[data-testid="window-1"]');

    // Open a second window via the toolbar button.
    await page.click('[data-testid="open-window"]');
    await page.waitForSelector('[data-testid="window-2"]');

    // Drag window-1 by its title bar.
    const titleBar = await page.$('[data-testid="window-1-titlebar"]');
    assert.ok(titleBar, 'Expected window-1 title bar to exist');

    const before = await getBox(page, '[data-testid="window-1"]');
    const titleBox = await titleBar.boundingBox();
    assert.ok(titleBox, 'Expected title bar to have a bounding box');

    const startX = titleBox.x + titleBox.width / 2;
    const startY = titleBox.y + titleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 80, startY + 60, { steps: 12 });
    await page.mouse.up();

    await sleep(50);
    const afterDrag = await getBox(page, '[data-testid="window-1"]');
    assert.ok(Math.abs(afterDrag.x - before.x) >= 10 || Math.abs(afterDrag.y - before.y) >= 10);

    // Minimize + restore.
    await page.click('[data-testid="window-1-minimize"]');
    await page.waitForFunction(() => document.querySelector('[data-testid="window-1"]')?.classList.contains('minimized'));

    await page.click('[data-testid="window-1-minimize"]');
    await page.waitForFunction(() => !document.querySelector('[data-testid="window-1"]')?.classList.contains('minimized'));

    // Maximize + restore.
    await page.click('[data-testid="window-1-maximize"]');
    await page.waitForFunction(() => document.querySelector('[data-testid="window-1"]')?.classList.contains('maximized'));

    await page.click('[data-testid="window-1-maximize"]');
    await page.waitForFunction(() => !document.querySelector('[data-testid="window-1"]')?.classList.contains('maximized'));

    // Close.
    await page.click('[data-testid="window-1-close"]');
    await page.waitForSelector('[data-testid="window-1"]', { hidden: true });
  } finally {
    await page.close();
  }
});

test('window-binding-counter: binding updates DOM and classes', async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    await page.goto(`${baseUrl}/window-binding-counter`, { waitUntil: 'load' });
    await waitForE2EReady(page);

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="counter-display"]');
      return el && el.textContent && el.textContent.includes('Count:');
    });

    const readDisplay = async () => page.$eval('[data-testid="counter-display"]', (el) => el.textContent || '');
    const readInfo = async () => page.$eval('[data-testid="counter-info"]', (el) => el.textContent || '');
    const readClasses = async () => page.$eval('[data-testid="counter-display"]', (el) => Array.from(el.classList));

    assert.equal(await readDisplay(), 'Count: 0');

    await page.click('[data-testid="counter-increment"]');
    await page.waitForFunction(() => document.querySelector('[data-testid="counter-display"]')?.textContent === 'Count: 1');
    assert.ok((await readClasses()).includes('positive'));
    assert.ok((await readClasses()).includes('odd'));

    await page.click('[data-testid="counter-increment"]');
    await page.waitForFunction(() => document.querySelector('[data-testid="counter-display"]')?.textContent === 'Count: 2');
    assert.ok((await readClasses()).includes('even'));
    assert.match(await readInfo(), /even/);

    await page.click('[data-testid="counter-decrement"]');
    await page.waitForFunction(() => document.querySelector('[data-testid="counter-display"]')?.textContent === 'Count: 1');

    await page.click('[data-testid="counter-reset"]');
    await page.waitForFunction(() => document.querySelector('[data-testid="counter-display"]')?.textContent === 'Count: 0');
    assert.ok((await readClasses()).includes('negative'));
    assert.ok((await readClasses()).includes('even'));
  } finally {
    await page.close();
  }
});

test('window-binding-sse: server push updates bound UI', async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    await page.goto(`${baseUrl}/window-binding-sse`, { waitUntil: 'load' });
    await waitForE2EReady(page);

    await page.waitForFunction(() => window.__E2E__ && window.__E2E__.sseConnected === true);

    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="sse-display"]');
      return el && el.textContent && el.textContent.includes('SSE value:');
    });

    // Push a known value via UI.
    await page.click('[data-testid="sse-push-42"]');
    await page.waitForFunction(() => document.querySelector('[data-testid=\"sse-display\"]')?.textContent?.includes('42'));

    // Push a second value via exposed helper.
    await page.evaluate(() => window.__E2E__.push(7));
    await page.waitForFunction(() => document.querySelector('[data-testid=\"sse-display\"]')?.textContent?.includes('7'));
  } finally {
    await page.close();
  }
});
