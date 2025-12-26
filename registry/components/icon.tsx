import React from "react";
import { Text } from "ink";

// Common Nerd Font Glyphs
export const Icons = {
  github: "\uf09b",
  folder: "\uf07b",
  cloud: "\uf0c2",
  database: "\uf1c0",
  warning: "\uf071",
  heart: "\uf004",
};

export const Icon = ({
  name,
  color,
}: {
  name: keyof typeof Icons;
  color?: string;
}) => <Text color={color}>{Icons[name]} </Text>;
