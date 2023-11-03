import { Page } from "puppeteer";

import { CrashContext } from "../../../contexts/blaze/CrashContext";
import { env } from "../../../constants/env";

/**
 * Minimum = 1
 */
const NUMBER_OF_PAGES = 1; // 300 register from page
const ITEMS_PER_PAGE = 300;
const LIMIT_BETS_LOAD = ITEMS_PER_PAGE * NUMBER_OF_PAGES;

export const loadCrashGames = async (page: Page) => {
  await Promise.all([
    page.waitForSelector("#history"),
    page.waitForSelector("#history > div"),
    page.click("#crash-recent > div.crash-previous > div.fairness-modal-link"),
  ]);

  const historyDiv = await page.$("#history");

  if (historyDiv) {
    for (let currentPage = 0; currentPage < NUMBER_OF_PAGES; currentPage++) {
      const bets = await historyDiv.$$("#history > div");

      if (bets && bets.length > 0) {
        const crashCtx = CrashContext.getInstance();

        for (const bet of bets.slice(0, LIMIT_BETS_LOAD).reverse()) {
          const pointResult = (await (
            await bet.$(".bet-amount")
          )?.evaluate((el) =>
            el.textContent ? parseFloat(el.textContent) : 0
          )) as number;
          const createdAt = (await (
            await bet.$("p")
          )?.evaluate((el) => el.textContent)) as string;

          crashCtx.addGame({
            providerId: null,
            point: undefined,
            pointResult,
            statusBet: "stand-by",
            status: "complete",
            createdAt,
            updatedAt: undefined,
            params: env.DEFAULT_CRASH_PARAMS,
          });
        }

        page.click(
          "#crash-analytics > div.body > div.footer > div > div > button:nth-child(2)"
        );
      }
    }
  }

  page.click("#parent-modal-close");
};
