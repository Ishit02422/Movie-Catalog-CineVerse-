"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import { useMovieStore } from "../context/MovieContext";
import { Navbar } from "../components/Navbar";
import { PhoneAuthHero } from "../components/PhoneAuthHero";
import { HeroBanner } from "../components/HeroBanner";
import { FilterBar } from "../components/FilterBar";
import { MovieGrid } from "../components/MovieGrid";
import { MovieCard } from "../components/MovieCard";
import { ProfileModal } from "../components/ProfileModal";
import {
  Film,
  Sparkles,
  Settings,
  Bookmark,
  Clock,
  Flame,
  ArrowRight,
  RotateCcw,
  Star,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { watchlist } = useWatchlist();
  const {
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
    clearRecentlyViewed,
    refreshMovies,
    isLoading: moviesLoading,
    error,
  } = useMovieStore();

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all"); // "all" | "watchlist"

  // Loading state while verifying authentication session
  if (authLoading || (moviesLoading && movies.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-[#e50914] flex items-center justify-center animate-pulse">
          <Film className="w-8 h-8" />
        </div>
        <div className="w-8 h-8 border-3 border-rose-500/30 border-t-[#e50914] rounded-full animate-spin" />
      </div>
    );
  }

  // 1. GUEST STATE: Full-screen Netflix-style Landing & Sign-in screens
  if (!isAuthenticated) {
    const featuredList = featuredMovies.length > 0 ? featuredMovies : movies.filter((m) => m.is_featured);
    return <PhoneAuthHero sampleMovies={featuredList} />;
  }

  // 2. AUTHENTICATED STATE: Full Movie Catalog Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white font-sans">
      {/* Sticky Navigation Header */}
      <Navbar
        totalMovies={movies.length}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Sleek User Greeting Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-gradient-to-r from-slate-900/90 via-[#0a0f1d] to-slate-950 border border-slate-800/80 p-5 sm:p-6 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#e50914] to-rose-600 flex items-center justify-center font-bold text-white shadow-md shadow-rose-600/30 text-lg sm:text-xl shrink-0">
              {user?.first_name
                ? user.first_name.charAt(0).toUpperCase()
                : user?.name
                ? user.name.charAt(0).toUpperCase()
                : "M"}
            </div>
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight">
                Welcome back, <span className="font-black text-white">{user?.name || `Member +91-${user?.phone?.slice(-4)}`}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Your personalized movie catalog and entertainment streaming portal is active.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: All Movies / My List */}
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800/80 text-xs font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[#e50914] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🍿 All Movies
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("watchlist")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
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
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[#e50914] flex items-center justify-center shadow-md">
                  <Bookmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">My Watchlist</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Movies you have saved to watch later ({watchlist.length} movies)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <span>Browse All Movies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-16 text-center space-y-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                  <Bookmark className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click the Bookmark icon on any movie card or detail page to save your favorite movies here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
                >
                  Explore Catalog Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 sm:gap-6">
                {watchlist.map((movie) => (
                  <MovieCard
                    key={movie.id || (movie as any)._id}
                    movie={movie}
                  />
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
            {/* Featured Hero Carousel Banner */}
            {!isFiltering && featuredMovies.length > 0 && (
              <HeroBanner
                movies={featuredMovies}
              />
            )}

            {/* Real-time Search and Multi-Filter Controls */}
            <FilterBar />

            {/* Active Filter Tags with 1-Click Clear */}
            {isFiltering && (
              <div className="flex flex-wrap items-center gap-2 -mt-4 bg-slate-900/80 p-3 sm:p-3.5 rounded-xl border border-slate-800/80 shadow-md animate-in fade-in">
                <span className="text-xs font-bold text-slate-300">Active Filters:</span>
                {selectedYear && (
                  <button
                    type="button"
                    onClick={() => setSelectedYear("")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-all cursor-pointer"
                    title="Click to remove Year filter"
                  >
                    <span>📅 Year: {selectedYear}</span>
                    <span className="text-rose-400 font-bold ml-0.5">✕</span>
                  </button>
                )}
                {selectedGenre !== "All" && (
                  <button
                    type="button"
                    onClick={() => setSelectedGenre("All")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-all cursor-pointer"
                    title="Click to remove Genre filter"
                  >
                    <span>⚡ Genre: {selectedGenre}</span>
                    <span className="text-rose-400 font-bold ml-0.5">✕</span>
                  </button>
                )}
                {search.trim() !== "" && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-all cursor-pointer"
                    title="Click to clear search text"
                  >
                    <span>🔍 Search: &ldquo;{search.trim()}&rdquo;</span>
                    <span className="text-rose-400 font-bold ml-0.5">✕</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 ml-auto transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>
            )}

            {/* Dynamic Movie Catalog Grid */}
            <MovieGrid
              movies={filteredMovies}
              isLoading={moviesLoading}
              error={error}
              onRetry={refreshMovies}
              title={catalogTitle}
            />

            {/* ========================================================================= */}
            {/* SECTION: PERSONALIZED RECOMMENDATIONS                                     */}
            {/* ========================================================================= */}
            {!isFiltering && recommendedMovies.length > 0 && (
              <section className="space-y-5 pt-8 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Recommended For You
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-normal">
                        Tailored to your favorite genres and viewing patterns
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 sm:gap-6">
                  {recommendedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id || (movie as any)._id}
                      movie={movie}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION: TOP RATED MASTERPIECES                                           */}
            {/* ========================================================================= */}
            {!isFiltering && topRatedMovies.length > 0 && (
              <section className="space-y-5 pt-8 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Flame className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Top Rated Masterpieces
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-normal">
                        Highest rated critically acclaimed cinema
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 sm:gap-6">
                  {topRatedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id || (movie as any)._id}
                      movie={movie}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION: RECENTLY VIEWED                                                  */}
            {/* ========================================================================= */}
            {!isFiltering && recentlyViewed.length > 0 && (
              <section className="space-y-5 pt-8 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Recently Viewed
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-normal">
                        Quickly resume movies you looked at recently
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearRecentlyViewed}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 sm:gap-6">
                  {recentlyViewed.slice(0, 7).map((movie) => (
                    <MovieCard
                      key={movie.id || (movie as any)._id}
                      movie={movie}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 text-center text-sm text-slate-400 mt-16">
        <div className="w-full px-4 sm:px-8 lg:px-12 space-y-2">
          <p className="font-bold text-white text-base">
            CineVerse Movie Catalog Application &copy; {new Date().getFullYear()}
          </p>
          <p className="text-slate-400">Built with Next.js, TypeScript, Tailwind CSS, Node.js & MongoDB.</p>
        </div>
      </footer>
    </div>
  );
}
