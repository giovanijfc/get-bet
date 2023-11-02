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
        (g) => g.statusBet !== "stand-by"
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
        PORCENTAGEM_DE_ACERTO: winPercentage,
      });
      console.log("");
      res();
    });
  }

  public getWinPercentageLastGames(qty: number, multiplierGain: number) {
    const indexLast =
      this.games.length - qty >= 0 ? this.games.length - 300 : 0;
    const lastIndexgame = this.games.length - 1;
    const lastGames = this.games.slice(indexLast, lastIndexgame);

    const totalGamesWin = lastGames.filter(
      (g) => g.pointResult && g.pointResult >= multiplierGain
    ).length;

    const winPercentageLastGames =
      totalGamesWin > 0 && lastGames.length > 0
        ? (totalGamesWin * 100) / lastGames.length
        : 0;

    return winPercentageLastGames;
  }
}
