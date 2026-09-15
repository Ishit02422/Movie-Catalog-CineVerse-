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
  onPlayTrailer?: (movie: Movie) => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  isLoading,
  error,
  onRetry,
  title = "Explore Movies",
  onPlayTrailer,
}) => {
  return (
    <section className="w-full space-y-8">
      {/* Section Header with larger bold fonts */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shadow-md">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              Showing <strong className="text-slate-200">{movies.length}</strong> {movies.length === 1 ? "movie" : "movies"} in catalog
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {!isLoading && error && (
        <div className="w-full rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center space-y-4 my-8">
          <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">
              Failed to load movies
            </h3>
            <p className="text-base text-red-300 max-w-md mx-auto">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#e50914] hover:bg-rose-600 text-white text-sm font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/40"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Empty Result State */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/40 p-14 text-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <Film className="w-8 h-8 opacity-70" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">No Movies Found</h3>
            <p className="text-base text-slate-400 max-w-sm mx-auto">
              We couldn't find any movies matching your current selection.
            </p>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id || movie._id}
              movie={movie}
              onPlayTrailer={onPlayTrailer}
            />
          ))}
        </div>
      )}
    </section>
  );
};
