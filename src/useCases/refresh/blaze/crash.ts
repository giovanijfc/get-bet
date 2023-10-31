import { Page } from "puppeteer";
import Tesseract from "tesseract.js";
import * as fs from "fs";

import { cropImage } from "../../../utils/cropImage";
import { CrashContext } from "../../../contexts/blaze/CrashContext";
import { env } from "../../../constants/env";
import blazeApi from "../../../apis/blazeApi";
import {
  BlazeApiCrashGame,
  BlazeApiCrashStatus,
} from "../../../typings/blazeApiResponseTypings";

const graphImgPath = "assets/generated-sources/crash-graph.png";

export const refreshGames = async () => {
  let isBusy = false;

  setInterval(async () => {
    if (isBusy) return;

    isBusy = true;

    const { data: currentGameApi } = await blazeApi.get<BlazeApiCrashGame>(
      "/crash_games/current"
    );

    const crashCtx = CrashContext.getInstance();
    crashCtx.setStatus(currentGameApi.status);

    const lastGame = crashCtx.getCurrentGame();

    if (lastGame.providerId === null) {
      crashCtx.addGame({
        providerId: currentGameApi.id,
        point: currentGameApi.crash_point
          ? parseFloat(currentGameApi.crash_point)
          : undefined,
        pointResult: undefined,
        status: currentGameApi.status,
        statusBet: "stand-by",
        createdAt: new Date().toISOString(),
        updatedAt: currentGameApi.updated_at || undefined,
        params: env.DEFAULT_CRASH_PARAMS,
      });
    } else {
      switch (currentGameApi.status) {
        case "waiting":
          if (lastGame.providerId !== currentGameApi.id) {
            crashCtx.addGame({
              providerId: currentGameApi.id,
              point: undefined,
              pointResult: undefined,
              status: currentGameApi.status,
              statusBet: "stand-by",
              createdAt: new Date().toISOString(),
              updatedAt: currentGameApi.updated_at || undefined,
              params: env.DEFAULT_CRASH_PARAMS,
            });
          }
          break;
        case "complete":
          if (lastGame.status !== "complete") {
            crashCtx.updateLastGame({
              point: env.DEFAULT_CRASH_PARAMS.RATE_MULTIPLIER_GAIN,
              pointResult: currentGameApi.crash_point
                ? parseFloat(currentGameApi.crash_point as string)
                : 1,
              status: "complete",
              updatedAt: currentGameApi.updated_at,
            });
          }
          break;
        case "graphing":
          if (lastGame.status !== "graphing") {
            crashCtx.updateLastGame({
              status: "graphing",
              updatedAt: currentGameApi.updated_at || undefined,
            });
          }
          break;
      }
    }

    isBusy = false;
  }, 500);
};

const getStatusFromTextContentCanvas = (
  textContentCanvas: string
): BlazeApiCrashStatus => {
  if (textContentCanvas.toLowerCase().includes("crashed")) {
    return "waiting";
  } else if (textContentCanvas.toLowerCase().includes("starting in")) {
    return "complete";
  } else {
    return "graphing";
  }
};

const cropImageParams = {
  inputPath: graphImgPath,
  outputPath: graphImgPath,
  width: 679,
  height: 383,
  x: 0,
  y: 0,
};

/**
 *  This function not working correctly but in next time can needed use
 */
export const refreshGamesWithCanvas = async (page: Page) => {
  const tesseractWorker = await Tesseract.createWorker("eng");

  let isBusy = false;

  setInterval(async () => {
    if (isBusy) return;

    isBusy = true;

    const canvas = await page.$("#crash-main-canvas");

    if (canvas) {
      const canvasBase64 = await canvas.evaluate(
        (el) => (el as any).toDataURL() as string
      );

      const base64Image = canvasBase64.split(";base64,").pop();

      if (base64Image) {
        const buffer = Buffer.from(base64Image, "base64");
        fs.writeFileSync(graphImgPath, buffer);
        await cropImage(cropImageParams);
      }

      const { data } = await tesseractWorker.recognize(graphImgPath);

      const crashCtx = CrashContext.getInstance();
      crashCtx.setStatus(getStatusFromTextContentCanvas(data.text));
      const lastGame = crashCtx.getCurrentGame();

      switch (crashCtx.getStatus()) {
        case "waiting":
          if (lastGame.status !== "waiting")
            crashCtx.addGame({
              providerId: null,
              point: undefined,
              pointResult: undefined,
              status: "waiting",
              statusBet: "stand-by",
              createdAt: new Date().toISOString(),
              updatedAt: undefined,
              params: env.DEFAULT_CRASH_PARAMS,
            });
          break;
        case "complete":
          if (lastGame.status !== "complete") {
            const pointResultString =
              data?.text?.match(/(\d+\.\d+x|\d+x)/i)?.[0];

            crashCtx.updateLastGame({
              point: env.DEFAULT_CRASH_PARAMS.RATE_MULTIPLIER_GAIN,
              pointResult: pointResultString
                ? parseFloat(pointResultString)
                : undefined,
              status: "complete",
            });
          }
          break;
        case "graphing":
          if (lastGame.status !== "graphing")
            crashCtx.updateLastGame({
              status: "graphing",
            });
          break;
      }
    }

    isBusy = false;
  }, 300);
};
