import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

import { fetchCurrentUser, loginUser, logoutUser, registerUser } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem("auth_token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setError("");
        const data = await fetchCurrentUser();
        if (isMounted) {
          setUser(data.user);
        }
      } catch (err) {
        window.localStorage.removeItem("auth_token");
        if (isMounted) {
          setToken(null);
          setUser(null);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(payload) {
    setIsLoading(true);
    setError("");
    try {
      const data = await loginUser(payload);
      window.localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(payload) {
    setIsLoading(true);
    setError("");
    try {
      const data = await registerUser(payload);
      window.localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);
    setError("");
    try {
      if (token) {
        await logoutUser();
      }
    } finally {
      window.localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      error,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
      register,
      user,
    }),
    [error, isLoading, token, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
