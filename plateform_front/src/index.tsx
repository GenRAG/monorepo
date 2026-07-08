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
import { GoogleOAuthProvider } from "@react-oauth/google";
import "lib/mixpanel";

window.addEventListener(
    "error",
    (e) => {
        if (e.message.includes("ResizeObserver loop")) e.stopImmediatePropagation();
    },
    true,
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ""}>
            <ReduxProvider>
                <ReactFlowProvider>
                    <ChakraProvider theme={themeNew} resetCSS>
                        <ColorModeScript initialColorMode={themeNew.config.initialColorMode} />
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </ChakraProvider>
                </ReactFlowProvider>
            </ReduxProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
);

reportWebVitals();
