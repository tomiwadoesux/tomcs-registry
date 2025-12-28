import React from "react";
import { Text, Box } from "ink";
// import figlet from "figlet"; // Removed to support dynamic loading

export const Banner = ({
  text,
  font = "Standard",
  color = "white",
}: {
  text: string;
  font?: any; // changed from figlet.Fonts to avoid strict type dep
  color?: string;
}) => {
  const [bannerText, setBannerText] = React.useState(text);

  React.useEffect(() => {
    const loadFiglet = async () => {
      try {
        const figlet = await import("figlet");
        // @ts-ignore
        setBannerText(figlet.default.textSync(text, { font }));
      } catch (e) {
        // Fallback to simple text if figlet is missing
        setBannerText(text);
      }
    };
    loadFiglet();
  }, [text, font]);

  return (
    <Box paddingY={1}>
      <Text color={color}>{bannerText}</Text>
    </Box>
  );
};
