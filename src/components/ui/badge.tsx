import React from "react";
import { Box, Text } from "ink";

type BadgeVariant = "success" | "warning" | "error" | "info";

export const Badge = ({
  label,
  variant = "info",
}: {
  label: string;
  variant?: BadgeVariant;
}) => {
  const colors: Record<BadgeVariant, string> = {
    success: "green",
    warning: "yellow",
    error: "red",
    info: "blue",
  };

  return (
    <Box paddingX={1} backgroundColor={colors[variant]}>
      <Text color="black" bold>
        {label.toUpperCase()}
      </Text>
    </Box>
  );
};
