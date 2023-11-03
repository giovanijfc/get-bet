import { Page } from "puppeteer";

import { CrashContext } from "../../../../contexts/blaze/CrashContext";
import { env } from "../../../../constants/env";
import { updateCountHourMinutesSeconds } from "../../../../utils/updateCountHourMinutesSeconds";
import { clearTerminal } from "../../../../utils/clearTerminal";
import { stat } from "fs";

export const defaultCrashStrategy = async (page: Page) => {
  const crashCtx = CrashContext.getInstance();

  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  setInterval(() => {
    const { updateSeconds, updateMinutes, updateHours } =
      updateCountHourMinutesSeconds(seconds, minutes, hours);
    seconds = updateSeconds;
    minutes = updateMinutes;
    hours = updateHours;
  }, 1000);

  let stats = {
    profit: 0,
    maximumLossBalance: 0,
    accumulatedLossValue: 0,
    wins: 0,
    loss: 0,
    currentBetValue: env.DEFAULT_CRASH_PARAMS.INITIAL_VALUE,
    consecutivesLosses: 0,
    consecutivesWins: 0,
    countSequencesLosses: new Array(),
  };

  crashCtx.onChangeGame = async (game) => {
    clearTerminal();

    switch (game.status) {
      case "waiting":
        await clearInputs(page);

        if (game.statusBet === "stand-by") {
          const betValue = parseFloat(
            String(Math.ceil(stats.currentBetValue * 100) / 100)
          ).toFixed(2);

          const inputBetValue = await page.$(
            'input[type="number"].input-field'
          );

          if (inputBetValue) await inputBetValue.type(betValue, { delay: 50 });

          const inputAutoCashout = await page.$(
            'input[data-testid="auto-cashout"]'
          );
          if (inputAutoCashout)
            await inputAutoCashout.type(
              env.DEFAULT_CRASH_PARAMS.RATE_MULTIPLIER_GAIN.toString(),
              { delay: 50 }
            );

          if (env.DEFAULT_CRASH_PARAMS.ENABLED_BET) {
            const placeButton = await page.$(
              "#crash-controller > div.body > div.regular-betting-controller > div.place-bet > button"
            );
            if (placeButton) await placeButton.click();
          }

          crashCtx.updateLastGame({ statusBet: "waiting-for-bet" }, false);
        }

        break;
      case "complete":
        if (game.pointResult === undefined) break;

        if (game.statusBet === "waiting-for-bet") {
          const isWin = game.params.RATE_MULTIPLIER_GAIN <= game.pointResult;

          const countLossIndex = stats.consecutivesLosses;

          if (isWin) {
            if (!stats.countSequencesLosses[countLossIndex]) {
              stats.countSequencesLosses[countLossIndex] = 0;
            }

            stats.countSequencesLosses[countLossIndex] += 1;
            stats["profit"] +=
              stats.currentBetValue * (game.params.RATE_MULTIPLIER_GAIN - 1);
            stats["consecutivesWins"] += 1;
            stats["consecutivesLosses"] = 0;
            stats["wins"] += 1;
            stats["currentBetValue"] = env.DEFAULT_CRASH_PARAMS.INITIAL_VALUE;
            crashCtx.updateLastGame({ statusBet: "gain" }, false);
          } else {
            if (stats["profit"] <= stats["maximumLossBalance"]) {
              stats["maximumLossBalance"] = stats["profit"];
            }

            stats["profit"] -= stats.currentBetValue;
            stats["accumulatedLossValue"] -= stats.currentBetValue;
            stats["consecutivesLosses"] += 1;
            stats["consecutivesWins"] = 0;
            stats["loss"] += 1;
            stats["currentBetValue"] *= env.DEFAULT_CRASH_PARAMS.RATE_INCREASE;

            crashCtx.updateLastGame({ statusBet: "loss" }, false);

            const isStop =
              stats.consecutivesLosses >=
              env.DEFAULT_CRASH_PARAMS.RETRY_WHEN_LOSS_LIMIT - 1;

            if (isStop) {
              stats["accumulatedLossValue"] = 0;
              stats["consecutivesLosses"] = 0;
              stats["currentBetValue"] = env.DEFAULT_CRASH_PARAMS.INITIAL_VALUE;
            }
          }
        }

        break;
    }
    console.log("");

    await crashCtx.printarRelatorio();

    const currentGame = crashCtx.getCurrentGame();
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    console.log("STATS_CURRENT_GAME: ");
    console.table({
      LUCRO: parseFloat(String(Math.ceil(stats.profit * 100) / 100)).toFixed(2),
      VALOR_APOSTA_ATUAL:
        currentGame.statusBet === "waiting-for-bet"
          ? parseFloat(
              String(Math.ceil(stats.currentBetValue * 100) / 100)
            ).toFixed(2)
          : "N/A",
      PERDA_ACUMULADA_TENTATIVA: parseFloat(
        String(stats.accumulatedLossValue)
      ).toFixed(2),
      STATUS_GAME: currentGame.status,
      STATUS_DA_APOSTA: currentGame.statusBet,
      PONTO_MULTIPLICADOR_RESULTADO: currentGame.pointResult
        ? parseFloat(String(currentGame.pointResult)).toFixed(2)
        : 0.0,
      VITORIAS_CONSECUTIVAS: stats.consecutivesWins,
      DERROTAS_CONSECUTIVAS: stats.consecutivesLosses,
      MAXIMO_DE_PERDA: parseFloat(
        String(Math.ceil(stats.maximumLossBalance * 100) / 100)
      ).toFixed(2),
      PONTO_MULTIPLICADOR_ALVO: currentGame.point
        ? parseFloat(String(currentGame.point)).toFixed(2)
        : 0.0,
      TEMPO_DE_SESSAO: formattedTime,
    });
    console.log("");

    const formattedCountSequencesLosses: { [key: number]: number } = {};
    stats.countSequencesLosses.forEach((element, index) => {
      formattedCountSequencesLosses[index] = element;
    });

    console.log("CONTADOR DE SEQUENCIA DE PERDAS: ");
    console.table(formattedCountSequencesLosses);

    if (
      game.status === "complete" &&
      game.statusBet === "waiting-for-bet" &&
      game.pointResult === undefined
    ) {
      throw new Error("POINT_RESULT cannot not be undefined");
    }
  };
};

const clearInputs = async (page: Page) => {
  const inputBetValueSelector = 'input[type="number"].input-field';
  const inputBetValue = await page.$(inputBetValueSelector);

  if (inputBetValue) {
    await inputBetValue.click({ clickCount: 3 }); // Seleciona o texto
    await inputBetValue.press("Backspace");
  }

  const inputAutoRemoveSelector = 'input[data-testid="auto-cashout"]';
  const inputAutoCashout = await page.$(inputAutoRemoveSelector);

  if (inputAutoCashout) {
    await inputAutoCashout.click({ clickCount: 3 }); // Seleciona o texto
    await inputAutoCashout.press("Backspace");
  }
};
