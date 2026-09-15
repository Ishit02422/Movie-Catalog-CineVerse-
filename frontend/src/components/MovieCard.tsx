"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Movie } from "../types/movie";
import { Star, Calendar, Bookmark, Check, ArrowUpRight, Eye } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [imageError, setImageError] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const movieId = movie.id || movie._id || "";
  const isSaved = isInWatchlist(movieId);

  const fallbackImage =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWatchlist(movie);
  };

  return (
    <Link
      href={`/movies/${movieId}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/40 hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={imageError ? fallbackImage : (movie.image_url || fallbackImage)}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Top Badges: Genre & Rating & Watchlist */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-950/95 text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-md">
            {movie.genre}
          </span>
          <div className="flex items-center gap-2">
            {movie.rating !== undefined && movie.rating >= 5 && movie.rating <= 10 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-950/95 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
            )}
            {/* Quick Watchlist Bookmark Button */}
            <button
              type="button"
              onClick={handleWatchlistClick}
              title={isSaved ? "Saved in My List (Click to remove)" : "Add to My List"}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 ${
                isSaved
                  ? "bg-[#e50914] text-white border-2 border-white shadow-rose-950 scale-105"
                  : "bg-black/80 hover:bg-[#e50914] text-white border border-white/30 hover:border-white backdrop-blur-md"
              }`}
            >
              {isSaved ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Hover Action Indicator */}
        <div className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg shadow-rose-600/50">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-col flex-1 p-5 space-y-2.5">
        {/* Release Year & Status with larger font */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>{movie.release_year}</span>
          </div>
          {movie.views_count !== undefined && movie.views_count > 0 && (
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>{movie.views_count.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Movie Title with larger bold font */}
        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-rose-400 transition-colors duration-200 line-clamp-1 leading-snug">
          {movie.title}
        </h3>

        {/* Short Description with readable size */}
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {movie.description}
        </p>
      </div>
    </Link>
  );
};
