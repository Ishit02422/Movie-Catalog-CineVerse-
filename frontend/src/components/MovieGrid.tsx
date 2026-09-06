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
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-400">
              Showing {movies.length} {movies.length === 1 ? "movie" : "movies"}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {!isLoading && error && (
        <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">
              Failed to load movies
            </h3>
            <p className="text-sm text-red-300/80 max-w-md mx-auto">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Empty Result State */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/30 p-12 text-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 text-slate-400 flex items-center justify-center mx-auto border border-slate-700/50">
            <Film className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Movies Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              We couldn't find any movies matching your current selection.
            </p>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id || movie._id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};
