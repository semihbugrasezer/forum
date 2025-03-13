"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@/utils/supabase/client";

type User = {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
} | null;

interface AuthContextType {
  user: User;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    async function getUser() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get the profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          setUser({
            id: user.id,
            email: user.email!,
            display_name: profile?.display_name || user.email?.split('@')[0],
            avatar_url: profile?.avatar_url,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          getUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  async function refreshUser() {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Get the profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        
        setUser({
          id: authUser.id,
          email: authUser.email!,
          display_name: profile?.display_name || authUser.email?.split('@')[0],
          avatar_url: profile?.avatar_url,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);