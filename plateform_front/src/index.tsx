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
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
});

if (process.env.NODE_ENV !== "production") {
    posthog.opt_out_capturing();
}

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
            <PostHogProvider client={posthog}>
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
            </PostHogProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
);

reportWebVitals();
