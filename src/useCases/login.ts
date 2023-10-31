import { Page } from "puppeteer";

import { env } from "../constants/env";

export const login = async (page: Page) => {
  await Promise.all([
    page.waitForNavigation(),
    page.goto(env.BASE_URL_BLAZE.concat("?modal=auth&tab=login")),
  ]);

  await page?.type('input[name="username"]', env.LOGIN_EMAIL);
  await page?.type('input[name="password"]', env.LOGIN_PASSWORD);

  await Promise.all([
    page.waitForNavigation,
    page.click("#auth-modal > div > form > div.input-footer > button"),
  ]);

  await Promise.all([
    page.waitForNavigation,
    page.click("#auth-modal > div > form > div.input-footer > button"),
  ]);

  await Promise.all([
    page.waitForNavigation,
    page.goto(env.BASE_URL_BLAZE.concat("games/crash")),
  ]);
};
