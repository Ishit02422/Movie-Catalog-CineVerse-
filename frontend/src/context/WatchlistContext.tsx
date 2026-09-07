"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Movie } from "../types/movie";
import { useAuth } from "./AuthContext";

interface WatchlistContextType {
  watchlist: Movie[];
  watchlistIds: Set<string>;
  isLoading: boolean;
  isInWatchlist: (movieId: string) => boolean;
  toggleWatchlist: (movie: Movie) => Promise<boolean>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://movie-catalog-cineverse.onrender.com/api"
    : "http://localhost:5000/api");

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch user's saved watchlist from backend (or fallback to localStorage for guests)
  const refreshWatchlist = useCallback(async () => {
    if (isAuthenticated && token) {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/watchlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const movies: Movie[] = data.data || [];
          setWatchlist(movies);
          setWatchlistIds(new Set(movies.map((m) => m.id || (m as any)._id)));
          return;
        }
      } catch (err) {
        console.warn("Failed to fetch backend watchlist:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // Fallback for guest mode / local storage
    try {
      const stored = localStorage.getItem("cineverse_guest_watchlist");
      if (stored) {
        const parsed: Movie[] = JSON.parse(stored);
        setWatchlist(parsed);
        setWatchlistIds(new Set(parsed.map((m) => m.id || (m as any)._id)));
      } else {
        setWatchlist([]);
        setWatchlistIds(new Set());
      }
    } catch (e) {
      console.warn("Local storage parse error:", e);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const isInWatchlist = useCallback(
    (movieId: string): boolean => {
      return watchlistIds.has(movieId);
    },
    [watchlistIds]
  );

  const toggleWatchlist = async (movie: Movie): Promise<boolean> => {
    const movieId = movie.id || (movie as any)._id;
    if (!movieId) return false;

    const currentlySaved = watchlistIds.has(movieId);
    const nextSavedState = !currentlySaved;

    // Optimistic UI update
    const nextIds = new Set(watchlistIds);
    let nextList = [...watchlist];

    if (currentlySaved) {
      nextIds.delete(movieId);
      nextList = nextList.filter((m) => (m.id || (m as any)._id) !== movieId);
    } else {
      nextIds.add(movieId);
      nextList.push(movie);
    }

    setWatchlistIds(nextIds);
    setWatchlist(nextList);

    // Persist to backend if authenticated
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_BASE_URL}/watchlist/toggle/${movieId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const resData = await res.json();
          return resData.isSaved;
        }
      } catch (err) {
        console.error("Backend watchlist toggle error:", err);
      }
    }

    // Persist to guest localStorage
    try {
      localStorage.setItem("cineverse_guest_watchlist", JSON.stringify(nextList));
    } catch (e) {
      console.warn("Failed to write to localStorage:", e);
    }

    return nextSavedState;
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watchlistIds,
        isLoading,
        isInWatchlist,
        toggleWatchlist,
        refreshWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};
