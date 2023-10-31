import { Page } from "puppeteer";

import { CrashContext } from "../../../contexts/blaze/CrashContext";
import { env } from "../../../constants/env";

/**
 * Maximum items: 299
 */
const HISTORY_LIMIT = 20;

export const loadCrashGames = async (page: Page) => {
  await Promise.all([
    page.waitForSelector("#history"),
    page.waitForSelector("#history > div"),
    page.click("#crash-recent > div.crash-previous > div.fairness-modal-link"),
  ]);

  const historyDiv = await page.$("#history");

  if (historyDiv) {
    const bets = await historyDiv.$$("#history > div");

    if (bets && bets.length > 0) {
      const crashCtx = CrashContext.getInstance();

      for (const bet of bets.slice(0, HISTORY_LIMIT).reverse()) {
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
    }
  }

  page.click("#parent-modal-close");
};
