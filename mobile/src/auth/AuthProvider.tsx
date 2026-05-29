import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout } from "@/api/auth";
import { setAccessTokenProvider, setUnauthorizedHandler } from "@/api/client";
import { clearAccessToken, getStoredAccessToken, saveAccessToken } from "@/storage/secureTokenStorage";
import type { Role, User } from "@/types/domain";
import { hasAnyRole } from "./roles";

type AuthContextValue = {
  user: User | null;
  isRestoring: boolean;
  signIn: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const accessTokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearSession = useCallback(async () => {
    accessTokenRef.current = null;
    setUser(null);
    await clearAccessToken();
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setAccessTokenProvider(() => accessTokenRef.current);
    setUnauthorizedHandler(() => {
      void clearSession();
    });

    return () => {
      setUnauthorizedHandler(undefined);
    };
  }, [clearSession]);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        const token = await getStoredAccessToken();
        accessTokenRef.current = token;

        if (token) {
          const currentUser = await getCurrentUser();

          if (mounted) {
            setUser(currentUser);
          }
        }
      } catch {
        await clearSession();
      } finally {
        if (mounted) {
          setIsRestoring(false);
        }
      }
    }

    void restore();

    return () => {
      mounted = false;
    };
  }, [clearSession]);

  const signIn = useCallback(async (role: Role) => {
    const session = await login({
      username: role === "super_user" ? "super" : "user",
      password: "mock-password",
      roleHint: role
    });

    accessTokenRef.current = session.access_token;
    await saveAccessToken(session.access_token);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    queryClient.clear();
  }, [queryClient]);

  const signOut = useCallback(async () => {
    try {
      try {
        await logout();
      } catch {
        // Local auth must still be cleared when the remote logout request fails.
      }
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const hasRole = useCallback((roles: Role[]) => hasAnyRole(user, roles), [user]);

  const value = useMemo(
    () => ({
      user,
      isRestoring,
      signIn,
      signOut,
      hasRole
    }),
    [hasRole, isRestoring, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
