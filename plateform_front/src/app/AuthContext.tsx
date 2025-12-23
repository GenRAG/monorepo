import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useAuthentification from "hooks/useAuthentification";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthentification();
  const [isInit, setIsInit] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoggedIn(isAuthenticated);
      setIsInit(true);
    }
  }, [isAuthenticated, isLoading]);

  if (!isInit) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: loggedIn, isLoading, login: () => setLoggedIn(true), logout: () => setLoggedIn(false) }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
