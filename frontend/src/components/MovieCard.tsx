"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Movie } from "../types/movie";
import { Star, Calendar, Bookmark, Check, Play, Eye } from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { getYouTubeTrailerUrl } from "../utils/trailerMap";

interface MovieCardProps {
  movie: Movie;
  onPlayTrailer?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPlayTrailer }) => {
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

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(movie);
    } else {
      window.open(getYouTubeTrailerUrl(movie.title), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Link
      href={`/movies/${movieId}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/30 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
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
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950/90 text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-sm">
            {movie.genre}
          </span>
          <div className="flex items-center gap-1.5">
            {movie.rating !== undefined && movie.rating >= 5 && movie.rating <= 10 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-slate-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
            )}
            {/* Quick Watchlist Bookmark Button */}
            <button
              type="button"
              onClick={handleWatchlistClick}
              title={isSaved ? "Saved in My List (Click to remove)" : "Add to My List"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 ${isSaved
                  ? "bg-[#e50914] text-white border-2 border-white shadow-rose-950 scale-105"
                  : "bg-black/80 hover:bg-[#e50914] text-white border border-white/30 hover:border-white backdrop-blur-md"
                }`}
            >
              {isSaved ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Center Hover Play Trailer Button */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
          <button
            type="button"
            onClick={handleTrailerClick}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e50914] hover:bg-rose-600 text-white font-bold text-xs shadow-xl shadow-rose-600/50 border border-rose-400/30 cursor-pointer active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Watch Trailer</span>
          </button>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-col flex-1 p-4 space-y-2">
        {/* Release Year & Status with refined typography */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>{movie.release_year}</span>
          </div>
          {movie.views_count !== undefined && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-emerald-400 font-semibold text-[11px] shadow-sm">
              <Eye className="w-3 h-3" />
              <span>
                {movie.views_count >= 1000000
                  ? `${(movie.views_count / 1000000).toFixed(1)}M views`
                  : movie.views_count >= 1000
                  ? `${(movie.views_count / 1000).toFixed(1)}k views`
                  : `${movie.views_count || 0} views`}
              </span>
            </div>
          )}
        </div>

        {/* Movie Title with balanced bold font */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-rose-400 transition-colors duration-200 line-clamp-1 leading-snug">
          {movie.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed flex-1 font-normal">
          {movie.description}
        </p>
      </div>
    </Link>
  );
};
