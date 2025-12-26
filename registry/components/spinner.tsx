import React, { useState, useEffect } from "react";
import { Text } from "ink";

const spinners = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  pipe: ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"],
};

export const Spinner = ({
  type = "dots",
  color = "cyan",
}: {
  type: keyof typeof spinners;
  color?: string;
}) => {
  const [frame, setFrame] = useState(0);
  const frames = spinners[type];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 80);
    return () => clearInterval(timer);
  }, [frames]);

  return <Text color={color}>{frames[frame]}</Text>;
};
