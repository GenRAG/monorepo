import { Box, useColorModeValue } from '@chakra-ui/react';
import Router from 'app/Router';
import React from 'react';

const App: React.FC = () => {

  return (
    <Box bg={useColorModeValue("grey.100", "grey.900")} minH="100vh" display="flex">
      <Router />
    </Box>
  );
};


export default App;
