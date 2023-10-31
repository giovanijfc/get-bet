export interface BlazeApiCrashGame {
  id: string;
  updated_at: string;
  status: BlazeApiCrashStatus;
  crash_point: string | null;
  bets: BlazeApiCrashBet[];
  total_eur_bet: string;
  total_bets_placed: string;
  total_eur_won: string;
}

export type BlazeApiCrashStatus = "graphing" | "complete" | "waiting";

export interface BlazeApiCrashBet {
  id: string;
  cashed_out_at: string | null;
  amount: number;
  currency_type: string;
  auto_cashout_at?: number;
  user: BlazeApiCrashUser;
  win_amount: any;
  status: string;
}

export interface BlazeApiCrashUser {
  id: number;
  id_str: string;
  username: string;
  rank: string;
}
