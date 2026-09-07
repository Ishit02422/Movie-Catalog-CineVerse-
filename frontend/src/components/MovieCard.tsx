"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "../types/movie";
import { Star, Calendar, Bookmark, Check, ArrowUpRight } from "lucide-react";
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
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/30 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <Image
          src={imageError ? fallbackImage : movie.image_url}
          alt={movie.title}
          fill
          unoptimized={Boolean(movie.image_url?.startsWith("data:")) || Boolean(imageError)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Top Badges: Genre & Rating & Watchlist */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/90 text-rose-300 border border-rose-500/20 backdrop-blur-md shadow-md">
            {movie.genre}
          </span>
          <div className="flex items-center gap-1.5">
            {movie.rating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/90 text-amber-300 border border-amber-500/20 backdrop-blur-md shadow-md">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
            )}
            {/* Quick Watchlist Bookmark Button */}
            <button
              type="button"
              onClick={handleWatchlistClick}
              title={isSaved ? "Saved in My List (Click to remove)" : "Add to My List"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 ${
                isSaved
                  ? "bg-[#e50914] text-white border-2 border-white shadow-red-950/80 scale-105"
                  : "bg-black/85 hover:bg-[#e50914] text-white border border-white/30 hover:border-white"
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

        {/* Hover Quick Action Indicator */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg shadow-rose-500/40">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-2">
        {/* Release Year & Status */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{movie.release_year}</span>
          </div>
          {movie.views_count !== undefined && movie.views_count > 0 && (
            <span className="text-[11px] text-slate-400">
              {movie.views_count.toLocaleString()} views
            </span>
          )}
        </div>

        {/* Movie Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-rose-400 transition-colors duration-200 line-clamp-1">
          {movie.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {movie.description}
        </p>
      </div>
    </Link>
  );
};
