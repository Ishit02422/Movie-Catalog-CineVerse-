"use client";

import React from "react";
import { Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { Film, AlertCircle, RefreshCw } from "lucide-react";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  isLoading,
  error,
  onRetry,
  title = "Explore Movies",
}) => {
  return (
    <section className="w-full space-y-6">
      {/* Section Header with balanced fonts */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[#e50914] flex items-center justify-center shadow-sm">
            <Film className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Showing <strong className="text-slate-200">{movies.length}</strong> {movies.length === 1 ? "movie" : "movies"} in catalog
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {!isLoading && error && (
        <div className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8 sm:p-10 text-center space-y-3 my-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              Failed to load movies
            </h3>
            <p className="text-xs sm:text-sm text-red-300 max-w-md mx-auto">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Empty Result State */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-10 sm:p-12 text-center space-y-3 my-6">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <Film className="w-6 h-6 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Movies Found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              We couldn't find any movies matching your current selection.
            </p>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id || movie._id}
              movie={movie}
            />
          ))}
        </div>
      )}
    </section>
  );
};
