import { Page } from "puppeteer";

import { env } from "../constants/env";
import { sleep } from "../utils/sleep";

export const login = async (page: Page) => {
  await Promise.all([
    page.waitForNavigation(),
    page.goto(env.BASE_URL_BLAZE.concat("?modal=auth&tab=login")),
  ]);

  await page?.type('input[name="username"]', env.LOGIN_EMAIL, { delay: 70 });
  await page?.type('input[name="password"]', env.LOGIN_PASSWORD, { delay: 70 });

  await sleep(300);

  await Promise.all([
    page.waitForNavigation(),
    page.click("#auth-modal > div > form > div.input-footer > button"),
  ]);

  await sleep(2000);

  await Promise.all([
    page.waitForNavigation(),
    page.goto(env.BASE_URL_BLAZE.concat("games/crash")),
  ]);
};
