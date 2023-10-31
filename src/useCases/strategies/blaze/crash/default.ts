import { Page } from "puppeteer";
import { CrashContext } from "../../../../contexts/blaze/CrashContext";
import { env } from "../../../../constants/env";
import { updateCountHourMinutesSeconds } from "../../../../utils/updateCountHourMinutesSeconds";

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
    balance: 0,
    consecutivesLosses: 0,
    consecutivesWins: 0,
    accumulatedLossValue: 0,
    currentBetValue: env.DEFAULT_CRASH_PARAMS.INITIAL_VALUE,
  };

  crashCtx.onChangeGame = (game) => {
    switch (game.status) {
      case "waiting":
        crashCtx.printarRelatorio();

        if (game.statusBet === "stand-by") {
          console.log("============================");
          console.log("FAZENDO APOSTAS...");
          console.log("============================");

          crashCtx.updateLastGame({ statusBet: "waiting-for-bet" }, false);
        }

        break;
      case "complete":
        if (game.pointResult === undefined) break;

        if (game.statusBet === "waiting-for-bet") {
          if (game.params.RATE_MULTIPLIER_GAIN <= game.pointResult) {
            stats = {
              balance:
                stats.balance +
                stats.currentBetValue * (game.params.RATE_MULTIPLIER_GAIN - 1),
              accumulatedLossValue: 0,
              consecutivesLosses: 0,
              consecutivesWins: stats.consecutivesWins + 1,
              currentBetValue: env.DEFAULT_CRASH_PARAMS.INITIAL_VALUE,
            };
            crashCtx.updateLastGame({ statusBet: "gain" }, false);
          } else {
            stats = {
              balance: stats.balance - stats.currentBetValue,
              accumulatedLossValue:
                stats.accumulatedLossValue + stats.currentBetValue,
              consecutivesLosses: stats.consecutivesLosses + 1,
              consecutivesWins: 0,
              currentBetValue:
                stats.currentBetValue * env.DEFAULT_CRASH_PARAMS.RATE_INCREASE,
            };
            crashCtx.updateLastGame({ statusBet: "loss" }, false);

            if (
              stats.consecutivesLosses >=
              env.DEFAULT_CRASH_PARAMS.RETRY_WHEN_LOSS_LIMIT
            ) {
              throw new Error(
                `LIMIT RETRY WHEN LOSS attain consecutivesLosses = ${stats.consecutivesLosses}`
              );
            }
          }
        }

        break;
    }

    const currentGame = crashCtx.getCurrentGame();
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    console.log("");
    console.log("STATS: ");
    console.table({
      SALDO: stats.balance,
      VALOR_APOSTA_ATUAL: stats.currentBetValue,
      VALOR_DE_PERDA_ACUMULADO_SESSAO: stats.accumulatedLossValue,
      VITORIAS_CONSECUTIVAS: stats.consecutivesWins,
      DERROTAS_CONSECUTIVAS: stats.consecutivesLosses,
      STATUS_GAME: currentGame.status,
      STATUS_DA_APOSTA: currentGame.statusBet,
      PONTO_MULTIPLICADOR_ALVO: currentGame.point,
      PONTO_MULTIPLICADOR_RESULTADO: currentGame.pointResult,
      TEMPO_DE_SESSAO: formattedTime,
    });
    console.log("");

    if (game.status === "complete" && game.pointResult === undefined) {
      throw new Error("POINT_RESULT cannot not be fined");
    }
  };
};
