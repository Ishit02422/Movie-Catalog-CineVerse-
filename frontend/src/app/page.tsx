"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Movie } from "../types/movie";
import { fetchMovies, fetchFeaturedMovies, fetchGenres } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import { useDebounce } from "../hooks/useDebounce";
import { Navbar } from "../components/Navbar";
import { PhoneAuthHero } from "../components/PhoneAuthHero";
import { HeroBanner } from "../components/HeroBanner";
import { FilterBar } from "../components/FilterBar";
import { MovieGrid } from "../components/MovieGrid";
import { MovieCard } from "../components/MovieCard";
import { ProfileModal } from "../components/ProfileModal";
import { Film, Sparkles, Settings, Bookmark, Clock, Flame, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { watchlist } = useWatchlist();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all"); // "all" | "watchlist"

  // Filter & Search states
  const [search, setSearch] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("year_desc");

  // Debounce search input by 350ms
  const debouncedSearch = useDebounce(search, 350);

  // Load initial movies, featured carousel, distinct genres, and recently viewed
  useEffect(() => {
    async function loadInitialMeta() {
      try {
        const [featuredData, genresData, allMovies] = await Promise.all([
          fetchFeaturedMovies(),
          fetchGenres(),
          fetchMovies(),
        ]);
        setFeaturedMovies(featuredData);
        setAvailableGenres(genresData);
        setMovies(allMovies);

        // Load recently viewed from localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("cineverse_recently_viewed");
          if (stored) {
            setRecentlyViewed(JSON.parse(stored));
          }
        }
      } catch (err) {
        console.error("Failed to load initial metadata:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialMeta();
  }, []);

  // Fetch filtered movies whenever search, genre, year, or sort changes (when authenticated)
  const loadFilteredMovies = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMovies({
        search: debouncedSearch,
        genre: selectedGenre,
        release_year: selectedYear ? Number(selectedYear) : undefined,
        sort: selectedSort,
      });
      setMovies(data);
    } catch (err: any) {
      console.error("Error fetching movies:", err);
      setError(
        err.message ||
          "Unable to connect to the backend server. Please verify the API is running on port 5000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFilteredMovies();
    }
  }, [debouncedSearch, selectedGenre, selectedYear, selectedSort, isAuthenticated]);

  // Derive unique years from dataset for year filter dropdown
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2014, 2010, 2008, 1999, 1994, 1972].forEach(
      (y) => years.add(y)
    );
    movies.forEach((m) => {
      if (m.release_year) years.add(m.release_year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [movies]);

  // Calculate Personalized Recommendations based on favorite genres
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
      .slice(0, 4);
  }, [watchlist, recentlyViewed, movies]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedGenre("All");
    setSelectedYear("");
    setSelectedSort("year_desc");
  };

  const isFiltering =
    search.trim() !== "" || selectedGenre !== "All" || selectedYear !== "";

  // Loading state while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[#e50914] flex items-center justify-center animate-pulse">
          <Film className="w-6 h-6" />
        </div>
        <div className="w-6 h-6 border-2 border-rose-500/30 border-t-[#e50914] rounded-full animate-spin" />
      </div>
    );
  }

  // 1. GUEST STATE: Full-screen Netflix-style Landing & Sign-in screens
  if (!isAuthenticated) {
    return <PhoneAuthHero sampleMovies={featuredMovies.length > 0 ? featuredMovies : movies} />;
  }

  // 2. AUTHENTICATED STATE: Full Movie Catalog Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Sticky Navigation Header */}
      <Navbar
        totalMovies={movies.length}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
        {/* Welcome User Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 px-6 py-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-700 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/20 text-base">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Welcome back, {user?.name || `Member +91-${user?.phone?.slice(-4)}`}!</span>
              </h2>
              <p className="text-xs text-slate-400">
                Your personalized movie catalog and streaming dashboard is ready.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* View Mode Toggle: All Movies / My List */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[#e50914] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Movies
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("watchlist")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "watchlist"
                    ? "bg-[#e50914] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My List ({watchlist.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700/80 hover:border-rose-500/40 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-rose-400" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* User Profile Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />

        {/* ========================================================================= */}
        {/* TAB 1: WATCHLIST / MY LIST VIEW                                           */}
        {/* ========================================================================= */}
        {activeTab === "watchlist" && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#e50914] flex items-center justify-center">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
                  <p className="text-xs text-slate-400">
                    Movies you have saved to watch later ({watchlist.length})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-16 text-center space-y-4 rounded-3xl bg-slate-900/40 border border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click the Bookmark icon on any movie card or detail page to add it here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {watchlist.map((movie) => (
                  <MovieCard key={movie.id || (movie as any)._id} movie={movie} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ALL MOVIES CATALOG VIEW                                            */}
        {/* ========================================================================= */}
        {activeTab === "all" && (
          <>
            {/* Featured Hero Carousel Banner (displayed when not actively filtering) */}
            {!isFiltering && featuredMovies.length > 0 && (
              <HeroBanner movies={featuredMovies} />
            )}

            {/* Real-time Search and Multi-Filter Controls */}
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              availableGenres={availableGenres}
              availableYears={availableYears}
              onClearFilters={handleClearFilters}
              totalResults={movies.length}
            />

            {/* Dynamic Movie Catalog Grid */}
            <MovieGrid
              movies={movies}
              isLoading={isLoading}
              error={error}
              onRetry={loadFilteredMovies}
              title={
                isFiltering
                  ? `Search Results (${movies.length})`
                  : "Explore Movies Catalog"
              }
            />

            {/* ========================================================================= */}
            {/* SECTION: PERSONALIZED RECOMMENDATIONS                                     */}
            {/* ========================================================================= */}
            {!isFiltering && recommendedMovies.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Recommended For You
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    Tailored to your viewing preferences
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {recommendedMovies.map((movie) => (
                    <MovieCard key={movie.id || (movie as any)._id} movie={movie} />
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION: RECENTLY VIEWED                                                  */}
            {/* ========================================================================= */}
            {!isFiltering && recentlyViewed.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Recently Viewed
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("cineverse_recently_viewed");
                      setRecentlyViewed([]);
                    }}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {recentlyViewed.slice(0, 4).map((movie) => (
                    <MovieCard key={movie.id || (movie as any)._id} movie={movie} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-slate-400">
            CineVerse Movie Catalog Application &copy; {new Date().getFullYear()}
          </p>
          <p>Built with Next.js, TypeScript, Tailwind CSS, Node.js & MongoDB.</p>
        </div>
      </footer>
    </div>
  );
}
