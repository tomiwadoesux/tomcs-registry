import sharp from "sharp";
import chalk from "chalk";

export async function convertImageToAscii(path: string, width: number = 40) {
  // 1. Load and resize image to fit terminal width
  const { data, info } = await sharp(path)
    .resize(width)
    .removeAlpha() // Standard terminals don't handle transparency well
    .raw()
    .toBuffer({ resolveWithObject: true });

  let ascii = "";
  const { channels } = info;

  // 2. Loop through pixels and map to "half-block" characters for better resolution
  // We use '▄' and '▀' to fit two vertical pixels into one character cell
  for (let y = 0; y < info.height; y += 2) {
    for (let x = 0; x < info.width; x++) {
      const offsetTop = (y * info.width + x) * channels;
      const offsetBottom = ((y + 1) * info.width + x) * channels;

      const rT = data[offsetTop];
      const gT = data[offsetTop + 1];
      const bT = data[offsetTop + 2];

      const rB = data[offsetBottom] || 0;
      const gB = data[offsetBottom + 1] || 0;
      const bB = data[offsetBottom + 2] || 0;

      // Generate the ANSI escape sequence for the top and bottom colors
      // bgRgb sets the background (top half of char cell, technically usually bottom if simple block but here we trick it)
      // Actually '▄' is bottom half. So 'rgb' sets the foreground (the block itself, bottom)
      // and 'bgRgb' sets the background (the empty space, top).

      // Top Pixel -> Background Color
      // Bottom Pixel -> Foreground Color ('▄')
      ascii += chalk.bgRgb(rT, gT, bT).rgb(rB, gB, bB)("▄");
    }
    ascii += "\n";
  }
  return ascii;
}
