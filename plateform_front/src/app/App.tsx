import { Box, useColorModeValue } from '@chakra-ui/react';
import Router from 'app/Router';
import React from 'react';

const App: React.FC = () => {
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} minH="100vh">
      <Router />
    </Box>
  );
};


export default App;
