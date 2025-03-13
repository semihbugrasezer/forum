import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  currentUser: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    // Here you would typically call your authentication API
    // For now, we'll just simulate a successful login
    setCurrentUser({ email });
  };

  const logout = async () => {
    // Here you would typically call your logout API
    setCurrentUser(null);
  };

  const register = async (email: string, password: string) => {
    // Here you would typically call your registration API
    setCurrentUser({ email });
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}