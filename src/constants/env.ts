import { CrashGame } from "../typings/gamesTypings";

export const env = {
  BASE_URL_BLAZE: "https://blaze-4.com/en/",
  BASE_URL_BLAZE_API: "https://blaze.com/api/",

  LOGIN_EMAIL: "giovanijfc@gmail.com",
  LOGIN_PASSWORD: "Biladi123@",

  DEFAULT_CRASH_PARAMS: {
    ENABLED_BET: false,
    LAST_GAMES: 300,
    MIN_PERCENTAGE_LAST_GAMES: 23,
    INITIAL_VALUE: 0.1,
    RATE_INCREASE: 1.4,
    RATE_MULTIPLIER_GAIN: 4,
    RETRY_WHEN_LOSS_LIMIT: 30,
  } as CrashGame["params"],
};
