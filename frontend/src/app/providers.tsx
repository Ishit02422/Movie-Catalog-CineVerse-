"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { WatchlistProvider } from "../context/WatchlistContext";
import { MovieProvider } from "../context/MovieContext";

/**
 * Providers is the root global state provider for the entire CineVerse application.
 * Manages:
 * 1. AuthContext (User session, Login, OTP, Profile)
 * 2. ToastContext (Global notification toasts across all pages)
 * 3. WatchlistContext (User Watchlist, Bookmark sync)
 * 4. MovieContext (Global movie catalog, search, filter, recommendations, and direct trailer launcher)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <WatchlistProvider>
          <MovieProvider>{children}</MovieProvider>
        </WatchlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}