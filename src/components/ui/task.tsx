import React from 'react';
import { Box } from 'ink';

interface StackProps {
  children: React.ReactNode;
  direction?: 'column' | 'row';
  gap?: number;
}

export const Stack = ({ children, direction = 'column', gap = 0 }: StackProps) => (
  <Box flexDirection={direction}>
    {React.Children.map(children, (child, index) => (
      <Box 
        marginBottom={direction === 'column' && index < React.Children.count(children) - 1 ? gap : 0}
        marginRight={direction === 'row' && index < React.Children.count(children) - 1 ? gap : 0}
      >
        {child}
      </Box>
    ))}
  </Box>
);