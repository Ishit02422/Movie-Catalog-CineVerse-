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


// Providers ek wrapper chhe je app na badha pages ne Login/User data ane Watchlist data use karva de chhe.
// Aa file browser ma run karavani chhe // Etle file ne ekdam top par lakhie 