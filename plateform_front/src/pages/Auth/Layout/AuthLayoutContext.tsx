import { createContext, useContext } from "react";

export interface AuthLayoutConfig {
    canGoBack?: () => void;
    showBackground?: boolean;
}

interface AuthLayoutContextType extends AuthLayoutConfig {
    setConfig: (config: AuthLayoutConfig) => void;
}

export const AuthLayoutContext = createContext<AuthLayoutContextType>({
    setConfig: () => {},
});

export const useAuthLayout = () => useContext(AuthLayoutContext);
