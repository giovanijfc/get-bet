import { GreyAlgorithm, Image } from "image-js";

export const cropImage = async (params: {
  inputPath: string;
  outputPath: string;
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const image = await Image.load(params.inputPath);

  const croppedImage = image.crop({
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
  });

  await croppedImage.save(params.outputPath);
};
