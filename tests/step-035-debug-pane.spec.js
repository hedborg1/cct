/**
 * Step 035 — Debug Pane
 * Tests LogService ring buffer, IPC streaming, renderer pane toggle/resize/clear.
 */

const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { appPath, launchEnv } = require('./helpers');

let electronApp;
let window;
let env;

test.beforeAll(async () => {
  env = launchEnv();
  electronApp = await electron.launch({
    args: [appPath],
    env,
    timeout: 90000,
  });
  window = await electronApp.firstWindow({ timeout: 90000 });
  await window.waitForSelector('[data-testid="sidebar"]', { timeout: 15000 });
});

test.afterAll(async () => {
  if (electronApp) await electronApp.close();
});

test('1 - log history IPC returns array', async () => {
  const history = await window.evaluate(() => window.electron_api.log.getHistory());
  expect(Array.isArray(history)).toBe(true);
});

test('2 - debug pane state defaults are persisted', async () => {
  const height = await window.evaluate(() => window.electron_api.windowState.getDebugPaneHeight());
  const open = await window.evaluate(() => window.electron_api.windowState.getDebugPaneOpen());
  expect(height).toBe(200);
  expect(open).toBe(false);
});

test('3 - debug pane exists in DOM and is collapsed by default', async () => {
  const pane = await window.evaluate(() => {
    const el = document.querySelector('[data-testid="debug-pane"]');
    if (!el) return null;
    return {
      exists: true,
      display: getComputedStyle(el).display,
      height: el.offsetHeight,
    };
  });
  expect(pane).not.toBeNull();
  expect(pane.height).toBe(0);
});

test('4 - Cmd+J toggles debug pane open and closed', async () => {
  // Initially collapsed
  let height = await window.evaluate(() => document.querySelector('[data-testid="debug-pane"]').offsetHeight);
  expect(height).toBe(0);

  // Toggle open
  await window.keyboard.press('Meta+j');
  await window.waitForTimeout(100);

  height = await window.evaluate(() => document.querySelector('[data-testid="debug-pane"]').offsetHeight);
  expect(height).toBeGreaterThan(0);

  const handleVisible = await window.evaluate(() =>
    document.querySelector('[data-testid="debug-pane-resize-handle"]').classList.contains('visible')
  );
  expect(handleVisible).toBe(true);

  // Toggle closed
  await window.keyboard.press('Meta+j');
  await window.waitForTimeout(100);

  height = await window.evaluate(() => document.querySelector('[data-testid="debug-pane"]').offsetHeight);
  expect(height).toBe(0);
});

test('5 - debug pane is resizable via drag handle', async () => {
  // Open the pane first
  const isOpen = await window.evaluate(() => document.querySelector('[data-testid="debug-pane"]').classList.contains('open'));
  if (!isOpen) await window.keyboard.press('Meta+j');
  await window.waitForTimeout(100);

  const handle = await window.$('[data-testid="debug-pane-resize-handle"]');
  const box = await handle.boundingBox();

  // Drag upward (increases pane height)
  await window.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await window.mouse.down();
  await window.mouse.move(box.x + box.width / 2, box.y - 50);
  await window.mouse.up();

  const newHeight = await window.evaluate(() => document.querySelector('[data-testid="debug-pane"]').offsetHeight);
  expect(newHeight).toBeGreaterThan(200);
});
