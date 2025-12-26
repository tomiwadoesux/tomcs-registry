import React from "react";
import { Text, Box } from "ink";
import figlet from "figlet";

export const Banner = ({
  text,
  font = "Standard",
  color = "white",
}: {
  text: string;
  font?: figlet.Fonts;
  color?: string;
}) => {
  const bannerText = figlet.textSync(text, { font });

  return (
    <Box paddingY={1}>
      <Text color={color}>{bannerText}</Text>
    </Box>
  );
};
