import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import themeNew from "themeNew/index";
import ReduxProvider from "store/reduxProvider";
import { AuthProvider } from "app/AuthContext";
import { ReactFlowProvider } from "@xyflow/react";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <React.StrictMode>
        <ReduxProvider>
            <ReactFlowProvider>
                <ChakraProvider theme={themeNew} resetCSS>
                    <ColorModeScript
                        initialColorMode={themeNew.config.initialColorMode}
                    />
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </ChakraProvider>
            </ReactFlowProvider>
        </ReduxProvider>
    </React.StrictMode>,
);

reportWebVitals();
