import React from 'react';
import { Box, Text, useStdout } from 'ink';
import { useTomcsLogic } from './hooks/use-logic';
import { Box, Text, Shell } from './components/ui';

export const GeneratedUI = () => {
  const { stdout } = useStdout();
  const width = stdout.columns || 80;
  const height = stdout.rows || 24;
  const liveData = useTomcsLogic({});

  return (
    // <Shell title="Generated App">
    <Box width="100%" height="100%">
      
    </Box>
    // </Shell>
  );
};