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
    console.log("");
    const totalGames = this.games.length;
    const totalGamesBets = this.games.filter(
      (g) => g.statusBet !== "stand-by"
    ).length;

    const gains = this.games.filter((g) => g.statusBet === "gain").length;
    const loss = this.games.filter((g) => g.statusBet === "loss").length;

    const winPercentage =
      gains > 0 && totalGamesBets > 0 ? (gains * 100) / totalGamesBets : 0;

    console.log("++++++++++++++++++++++++++++++++++++++++");
    console.log("TOTAL DE JOGOS: " + totalGames);
    console.log("TOTAL DE JOGOS APOSTADOS: " + totalGamesBets);
    console.log("TOTAL JOGOS GANHOS: ", gains);
    console.log("TOTAL JOGOS PERDIDOS: ", loss);
    console.log("PORCENTAGEM DE ACERTO: ", winPercentage);
    console.log("++++++++++++++++++++++++++++++++++++++++");

    console.log("");
  }
}
