import React from "react";
import { Box, Text } from "ink";

export const Card = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor="white"
    padding={1}
    marginBottom={1}
  >
    <Box marginBottom={1}>
      <Text bold underline color="green">
        {title}
      </Text>
    </Box>
    {children}
  </Box>
);
