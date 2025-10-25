import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import themeNew from 'themeNew/index';
import { Provider } from 'react-redux';
import { store } from './store'
import ReduxProvider from 'store/reduxProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
      <ReduxProvider>
        <ChakraProvider theme={themeNew} resetCSS>
          <ColorModeScript initialColorMode={themeNew.config.initialColorMode} />
          <App />
        </ChakraProvider>
      </ReduxProvider>
  </React.StrictMode>
);

reportWebVitals();
