import { env } from "../../constants/env";
import { BlazeApiCrashStatus } from "../../typings/blazeApiResponseTypings";
import { CrashGame } from "../../typings/gamesTypings";

export class CrashContext {
  private static instance: CrashContext;
  private games: CrashGame[] = [];
  private status: BlazeApiCrashStatus | undefined = undefined;
  public onChangeGame: ((game: CrashGame) => void) | undefined = undefined;

  private constructor() {}

  public static getInstance(): CrashContext {
    if (!CrashContext.instance) {
      CrashContext.instance = new CrashContext();
    }
    return CrashContext.instance;
  }

  public addGame(game: CrashGame) {
    this.games.push(game);
    this.onChangeGame?.(game);
  }

  public getCurrentGame() {
    return this.games[this.games.length - 1];
  }

  public updateLastGame(game: Partial<CrashGame>, notify = true) {
    const lastGame = this.getCurrentGame();
    const updatedLastGame = {
      ...lastGame,
      ...game,
      updateAt: game.updatedAt || new Date().toISOString(),
    };
    this.games[this.games.length - 1] = updatedLastGame;

    if (notify) this.onChangeGame?.(updatedLastGame);
  }

  public getStatus() {
    return this.status;
  }

  public setStatus(status: BlazeApiCrashStatus) {
    this.status = status;
  }

  public printarRelatorio() {
    return new Promise<void>((res) => {
      const totalGames = this.games.length;

      const totalGamesBets = this.games.filter(
        (g) =>
          g.statusBet === "gain" ||
          g.statusBet === "loss" ||
          g.statusBet === "waiting-for-bet"
      );
      const gains = totalGamesBets.filter((g) => g.statusBet === "gain").length;
      const loss = totalGamesBets.filter((g) => g.statusBet === "loss").length;

      const winPercentage =
        gains > 0 && totalGamesBets.length > 0
          ? (gains * 100) / totalGamesBets.length
          : 0;

      console.log("SESSION_STATS");
      console.table({
        TOTAL_DE_JOGOS: totalGames,
        TOTAL_DE_JOGOS_APOSTADOS: totalGamesBets.length,
        TOTAL_JOGOS_GANHOS: gains,
        TOTAL_JOGOS_PERDIDOS: loss,
        PORCENTAGEM_DE_ACERTO: parseFloat(String(winPercentage))
          .toFixed(2)
          .concat("%"),
      });
      console.log("");
      res();
    });
  }
}
