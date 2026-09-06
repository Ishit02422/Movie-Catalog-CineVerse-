"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { WatchlistProvider } from "../context/WatchlistContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WatchlistProvider>{children}</WatchlistProvider>
    </AuthProvider>
  );
}
