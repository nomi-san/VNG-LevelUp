import { expect, test } from "@playwright/test";
import { _electron as electron, type ElectronApplication, type Page } from "playwright";

import { mockGames } from "./mock-games";
import { makeMockResponse } from "./mock-response";

let app: ElectronApplication;
let window: Page;

async function findAsync<T>(
  arr: T[],
  asyncCallback: (arg: T) => Promise<boolean>,
): Promise<T | undefined> {
  const promises = arr.map(asyncCallback);
  const results = await Promise.all(promises);
  const index = results.findIndex((result) => result);
  return arr[index];
}

test.beforeAll(async () => {
  app = await electron.launch({
    args: ["out/main/index.js"],
  });

  await app.firstWindow();
  const result = await findAsync(app.windows(), async (w) => {
    console.log(await w.title());
    return (await w.title()) === "Level Up Launcher";
  });
  window = result!;

  const { type, limit, offset } = {
    type: "host",
    limit: 20,
    offset: 0,
  };

  await window.route(
    `https://test-nexus.vnggames.net/api/product/v1/products?type=${type}&limit=${limit}&offset=${offset}`,
    async (route) => {
      const response = JSON.stringify(makeMockResponse({ items: mockGames }));

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: response,
        contentType: "application/json",
      });
    },
  );
  await window.waitForLoadState("domcontentloaded");
  await window.waitForLoadState("load");
  await window.waitForLoadState("networkidle"); // Ensure page is fully loaded
});

test.afterAll(async () => {
  if (app) await app.close();
});

test("should render root", async () => {
  await window.waitForSelector("#root", { state: "visible" });
  const appRoot = window.locator("#root");
  expect(await appRoot.isVisible()).toBe(true);
});

test("should navigate to game details page", async () => {
  const firstGameCardSelector = `[data-testid="game-card-${mockGames[0].id}"]`;
  await window.waitForSelector(firstGameCardSelector, {
    state: "visible",
  });
  const firstGameCard = window.locator(firstGameCardSelector);

  await firstGameCard.click();

  const gameActions = `[data-testid="game-action"]`;
  await window.waitForSelector(gameActions, {
    state: "visible",
  });
});
