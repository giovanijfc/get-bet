import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockPlugin from "puppeteer-extra-plugin-adblocker";

import { defaultCrashStrategy } from "./useCases/strategies/blaze/crash/default";
import { loadCrashGames } from "./useCases/load/blaze/crash";
import { env } from "./constants/env";
import { refreshGames } from "./useCases/refresh/blaze/crash";
import { login } from "./useCases/login";
import { sleep } from "./utils/sleep";

const initFlow = async (page: Page) => {
  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  await login(page);
  await loadCrashGames(page);
  await refreshGames();
  await defaultCrashStrategy(page);
};

const start = async () => {
  puppeteer.use(StealthPlugin());
  puppeteer.use(AdblockPlugin());

  puppeteer
    .launch({
      headless: false,
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    })
    .then(async (browser) => {
      initFlow(await browser.newPage());
    });
};

start();
