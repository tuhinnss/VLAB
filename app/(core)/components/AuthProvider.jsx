"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, isFirebaseConfigured, listenToAuth, signOutUser } from "../../lib/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  isConfigured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = listenToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signOut: signOutUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
