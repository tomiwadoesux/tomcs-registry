import sharp from "sharp";
import chalk from "chalk";

export async function convertImageToAscii(path: string, width: number = 40) {
  // 1. Load and resize image
  const { data, info } = await sharp(path)
    .resize(width)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const chars = " .:-=+*#%@"; // Simple density map
  // For detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. " (reversed?)
  // Dark to Light or Light to Dark? Usually @ is dark (ink).
  // In a terminal, background is black. So @ (lots of pixels) = light/white?
  // No, usuallly @ = Bright/Filled. ' ' = Dark/Empty.
  // Let's use a standard list.
  const dens =
    "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
  // This string usually goes from Dark (lots of ink) to Light (little ink)?
  // Actually on black terminal: @ is lots of lit pixels = Bright. . is few lit pixels = Dark.
  // Wait, no. If I print '@' in white, it's a big white blob. So it's BRIGHT.
  // If I print '.' in white, it's mostly black. So it's DARK.
  // So map 255 (White) -> @. Map 0 (Black) -> ' '.

  let ascii = "";
  const { channels } = info;

  // 2. Loop through pixels
  // We skip every other line to maintain ~2:1 aspect ratio of terminal characters
  for (let y = 0; y < info.height; y += 2) {
    for (let x = 0; x < info.width; x++) {
      const i1 = (y * info.width + x) * channels;
      const i2 = ((y + 1) * info.width + x) * channels;

      // Check if second row exists
      const hasNextRow = y + 1 < info.height;

      let r = data[i1];
      let g = data[i1 + 1];
      let b = data[i1 + 2];

      if (hasNextRow) {
        r = Math.floor((r + data[i2]) / 2);
        g = Math.floor((g + data[i2 + 1]) / 2);
        b = Math.floor((b + data[i2 + 2]) / 2);
      }

      const brightness = (r + g + b) / 3;
      // Map 0-255 to 0-(len-1)
      // dens[0] = '$' (Dense/Bright), dens[last] = ' ' (Empty/Dark)
      // So if 255 (Bright) we want '$'.
      // If 0 (Dark) we want ' '.
      // Let's check the string. ' ' is at the end.
      // So index 0 is bright?
      // Re-eval: '$' uses more pixels. In white-on-black terminal, '$' is brighter than '.'.
      // So High Brightness (255) -> Index 0.
      // Low Brightness (0) -> Index Last.

      // Alternatively, we can reverse the index calculation.
      const len = dens.length;
      const index = Math.floor((brightness / 255) * (len - 1));

      // If brightness is high (255), index is high.
      // dens[high] = ' ' (Empty). That means 255 -> Empty. That's inverted for black background.
      // For black background: 255 (White) should be Dense ('$').
      // So 255 -> Index 0. 0 -> Index Last.

      const charIndex = len - 1 - index;
      // Brightness 255 -> index=(len-1) -> charIndex=0 -> '$' (Bright). Correct.
      // Brightness 0 -> index=0 -> charIndex=(len-1) -> ' ' (Dark). Correct.

      const char = dens[charIndex];

      ascii += chalk.rgb(r, g, b)(char);
    }
    ascii += "\n";
  }
  return ascii;
}
``;
