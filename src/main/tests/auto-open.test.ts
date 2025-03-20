import { test } from "@playwright/test";
import { _electron as electron, type ElectronApplication, type Page } from "playwright";

let app: ElectronApplication;
let window: Page;

test("should auto open details page when passing in game id as argument", async () => {
  app = await electron.launch({
    args: ["out/main/index.js", "--downloadGameOnLaunch=226249373746831366"],
    env: {
      ...process.env,
      TEST_ENV: "playwright",
    },
  });

  window = await app.firstWindow();

  const gameActions = `[data-testid="game-details-container-226249373746831366"]`;
  await window.waitForSelector(gameActions, {
    state: "visible",
  });

  const downloadButton = `[data-testid="download-start-button-226249373746831366"]`;
  await window.waitForSelector(downloadButton, {
    state: "visible",
  });
});
