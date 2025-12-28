import React, { useContext } from "react";
import { Box, Text, useInput } from "ink";
import { FocusContext } from "../../hooks/use-focus";

interface ButtonProps {
  id?: string;
  label: string;
  nextId?: string;
  prevId?: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "ghost";
}

export const Button = ({
  id,
  label,
  nextId,
  prevId,
  onClick,
  variant = "default",
}: ButtonProps) => {
  const focusContext = useContext(FocusContext);
  const isFocused = id ? focusContext?.activeId === id : false;

  useInput((input, key) => {
    if (!isFocused || !id) return;

    if (key.return && onClick) onClick();
    if (key.downArrow && nextId && focusContext?.setActiveId)
      focusContext.setActiveId(nextId);
    if (key.upArrow && prevId && focusContext?.setActiveId)
      focusContext.setActiveId(prevId);
  });

  const getColor = () => {
    if (variant === "destructive") return "red";
    if (variant === "ghost") return "gray";
    return "cyan";
  };

  return (
    <Box
      borderStyle={isFocused ? "double" : "single"}
      borderColor={isFocused ? getColor() : "gray"}
      paddingX={1}
      marginRight={1}
    >
      <Text color={isFocused ? "white" : "gray"} bold={isFocused}>
        {isFocused ? `> ${label}` : label}
      </Text>
    </Box>
  );
};
