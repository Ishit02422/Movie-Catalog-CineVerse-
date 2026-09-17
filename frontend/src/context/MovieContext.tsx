"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Movie } from "../types/movie";
import { fetchMovies, fetchFeaturedMovies, fetchGenres } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useWatchlist } from "./WatchlistContext";
import { getYouTubeTrailerUrl } from "../utils/trailerMap";

interface MovieContextType {
  // Data Collections
  movies: Movie[];
  featuredMovies: Movie[];
  availableGenres: string[];
  availableYears: number[];
  recentlyViewed: Movie[];
  recommendedMovies: Movie[];
  trendingMovies: Movie[];
  topRatedMovies: Movie[];

  // Filter & Search State
  search: string;
  selectedGenre: string;
  selectedYear: string;
  selectedSort: string;
  isFiltering: boolean;
  filteredMovies: Movie[];
  catalogTitle: string;

  // Global Actions
  setSearch: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedYear: (year: string) => void;
  setSelectedSort: (sort: string) => void;
  resetFilters: () => void;
  recordRecentlyViewed: (movie: Movie) => void;
  clearRecentlyViewed: () => void;
  refreshMovies: () => Promise<void>;
  updateMovieInStore: (movie: Movie) => void;

  // Direct Trailer Action
  openTrailerModal: (movie: Movie) => void;

  // Status
  isLoading: boolean;
  error: string | null;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { watchlist } = useWatchlist();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("year_desc");

  // Direct YouTube Official Trailer Launcher
  const openTrailerModal = useCallback((movie: Movie) => {
    if (typeof window !== "undefined" && movie) {
      const url = getYouTubeTrailerUrl(movie.title, (movie as any).trailer_url);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  // Fetch initial all movies, featured movies, and genres from backend API
  const refreshMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allMovies, featuredData, genresData] = await Promise.all([
        fetchMovies(),
        fetchFeaturedMovies(),
        fetchGenres(),
      ]);
      setMovies(allMovies);
      setFeaturedMovies(featuredData);
      setAvailableGenres(genresData);
    } catch (err: any) {
      console.error("MovieContext fetch error:", err);
      setError(
        err.message ||
          "Unable to connect to the backend server. Please verify the API is running."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMovies();
  }, [refreshMovies]);

  // Load recently viewed from localStorage specifically for the active user
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userKey = user?.id
          ? `cineverse_recently_viewed_${user.id}`
          : "cineverse_recently_viewed_guest";
        const stored = localStorage.getItem(userKey);
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        } else {
          setRecentlyViewed([]);
        }
      } catch (e) {
        console.warn("Could not load recently viewed:", e);
        setRecentlyViewed([]);
      }
    }
  }, [user?.id]);

  // Record a movie view into recentlyViewed store
  const recordRecentlyViewed = useCallback(
    (movie: Movie) => {
      if (typeof window === "undefined" || !movie) return;
      try {
        const userKey = user?.id
          ? `cineverse_recently_viewed_${user.id}`
          : "cineverse_recently_viewed_guest";
        const stored = localStorage.getItem(userKey);
        let list: Movie[] = stored ? JSON.parse(stored) : [];
        const currentId = movie.id || (movie as any)._id;
        list = list.filter((item) => (item.id || (item as any)._id) !== currentId);
        list.unshift(movie);
        if (list.length > 14) list = list.slice(0, 14);
        localStorage.setItem(userKey, JSON.stringify(list));
        setRecentlyViewed(list);
      } catch (e) {
        console.warn("Failed to store recently viewed:", e);
      }
    },
    [user?.id]
  );

  // Clear recently viewed history
  const clearRecentlyViewed = useCallback(() => {
    if (typeof window !== "undefined") {
      const userKey = user?.id
        ? `cineverse_recently_viewed_${user.id}`
        : "cineverse_recently_viewed_guest";
      localStorage.removeItem(userKey);
      localStorage.removeItem("cineverse_recently_viewed");
      setRecentlyViewed([]);
    }
  }, [user?.id]);

  // Dynamic list of release years (from current year down to 1950)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= 1950; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Filtered & Sorted Movies computation
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Search query filter (title, description, genre)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.genre && m.genre.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (selectedGenre && selectedGenre !== "All") {
      result = result.filter(
        (m) => m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    // Release Year filter
    if (selectedYear) {
      const yr = Number(selectedYear);
      result = result.filter((m) => m.release_year === yr);
    }

    // Sorting modes
    switch (selectedSort) {
      case "year_desc":
        result.sort((a, b) => b.release_year - a.release_year);
        break;
      case "year_asc":
        result.sort((a, b) => a.release_year - b.release_year);
        break;
      case "rating_desc":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "title_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "views_desc":
        result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      default:
        result.sort((a, b) => b.release_year - a.release_year);
    }

    return result;
  }, [movies, search, selectedGenre, selectedYear, selectedSort]);

  // Is filtering active
  const isFiltering = useMemo(() => {
    return (
      search.trim() !== "" ||
      selectedGenre !== "All" ||
      selectedYear !== "" ||
      selectedSort !== "year_desc"
    );
  }, [search, selectedGenre, selectedYear, selectedSort]);

  // Dynamic Catalog Title
  const catalogTitle = useMemo(() => {
    if (search.trim()) {
      return `Search Results for "${search.trim()}"`;
    }
    if (selectedGenre !== "All" && selectedYear) {
      return `${selectedGenre} Movies (${selectedYear})`;
    }
    if (selectedGenre !== "All") {
      return `${selectedGenre} Movies`;
    }
    if (selectedYear) {
      return `Release Year ${selectedYear} Movies`;
    }
    switch (selectedSort) {
      case "year_desc":
        return "Latest Releases & Movies";
      case "year_asc":
        return "Classic & Oldest Movies";
      case "rating_desc":
        return "★ Top Rated Movies (Highest Rating)";
      case "title_asc":
        return "Movies in Alphabetical Order (A to Z)";
      case "title_desc":
        return "Movies in Reverse Order (Z to A)";
      case "views_desc":
        return "🔥 Most Popular & Trending";
      default:
        return "Explore Movies Catalog";
    }
  }, [search, selectedGenre, selectedYear, selectedSort]);

  // Personalized Recommendations calculation
  const recommendedMovies = useMemo(() => {
    const userSample = [...watchlist, ...recentlyViewed];
    if (userSample.length === 0) return [];

    const genreFreq: Record<string, number> = {};
    userSample.forEach((m) => {
      if (m.genre) {
        m.genre.split(/[,/|]/).forEach((g) => {
          const clean = g.trim().toLowerCase();
          if (clean) genreFreq[clean] = (genreFreq[clean] || 0) + 1;
        });
      }
    });

    const topGenre = Object.keys(genreFreq).sort((a, b) => genreFreq[b] - genreFreq[a])[0];
    if (!topGenre) return [];

    const sampleIds = new Set(userSample.map((m) => m.id || (m as any)._id));
    return movies
      .filter((m) => {
        const mId = m.id || (m as any)._id;
        return (
          !sampleIds.has(mId) &&
          m.genre &&
          m.genre.toLowerCase().includes(topGenre)
        );
      })
      .slice(0, 7);
  }, [watchlist, recentlyViewed, movies]);

  // Trending Movies
  const trendingMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 7);
  }, [movies]);

  // Top Rated Movies
  const topRatedMovies = useMemo(() => {
    return [...movies]
      .filter((m) => m.rating !== undefined && m.rating >= 7.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 7);
  }, [movies]);

  // Reset all filters
  // Dynamically update a single movie's details (e.g. view count / rating) in global state
  const updateMovieInStore = useCallback((updatedMovie: Movie) => {
    if (!updatedMovie) return;
    const movieId = updatedMovie.id || (updatedMovie as any)._id;
    setMovies((prev) =>
      prev.map((m) => ((m.id || (m as any)._id) === movieId ? { ...m, ...updatedMovie } : m))
    );
    setFeaturedMovies((prev) =>
      prev.map((m) => ((m.id || (m as any)._id) === movieId ? { ...m, ...updatedMovie } : m))
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSelectedGenre("All");
    setSelectedYear("");
    setSelectedSort("year_desc");
  }, []);

  return (
    <MovieContext.Provider
      value={{
        movies,
        featuredMovies,
        availableGenres,
        availableYears,
        recentlyViewed,
        recommendedMovies,
        trendingMovies,
        topRatedMovies,
        search,
        selectedGenre,
        selectedYear,
        selectedSort,
        isFiltering,
        filteredMovies,
        catalogTitle,
        setSearch,
        setSelectedGenre,
        setSelectedYear,
        setSelectedSort,
        resetFilters,
        recordRecentlyViewed,
        clearRecentlyViewed,
        refreshMovies,
        updateMovieInStore,
        openTrailerModal,
        isLoading,
        error,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export function useMovieStore() {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovieStore must be used within a MovieProvider");
  }
  return context;
}
