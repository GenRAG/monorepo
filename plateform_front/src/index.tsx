import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import themeNew from 'themeNew/index';
import { Provider } from 'react-redux';
import { store } from './store'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={themeNew} resetCSS>
        <App />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
