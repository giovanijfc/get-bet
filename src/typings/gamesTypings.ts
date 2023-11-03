import { BlazeApiCrashStatus } from "./blazeApiResponseTypings";

export interface CrashGame {
  providerId: string | null;
  createdAt: string;
  updatedAt: string | undefined;
  point: number | undefined;
  pointResult: number | undefined;
  statusBet:
    | "stand-by"
    | "waiting-for-bet"
    | "low-win-percentage"
    | "gain"
    | "loss";
  status: BlazeApiCrashStatus;
  params: {
    ENABLED_BET: boolean;
    MIN_PERCENTAGE_LAST_GAMES: number;
    INITIAL_VALUE: number;
    RATE_INCREASE: number;
    RATE_MULTIPLIER_GAIN: number;
    RETRY_WHEN_LOSS_LIMIT: number;
  };
}
