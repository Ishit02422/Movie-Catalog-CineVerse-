"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Play, Star, Calendar, Bookmark, Check, ExternalLink, Sparkles } from "lucide-react";
import { useMovieStore } from "../context/MovieContext";
import { useWatchlist } from "../context/WatchlistContext";
import { getYouTubeEmbedUrl, getYouTubeTrailerUrl } from "../utils/trailerMap";

export const GlobalTrailerModal: React.FC = () => {
  const { trailerModalMovie, closeTrailerModal } = useMovieStore();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTrailerModal();
      }
    };
    if (trailerModalMovie) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [trailerModalMovie, closeTrailerModal]);

  if (!trailerModalMovie) return null;

  const movieId = trailerModalMovie.id || (trailerModalMovie as any)._id;
  const isSaved = isInWatchlist(movieId);
  const embedUrl = getYouTubeEmbedUrl(trailerModalMovie.title);
  const searchTrailerUrl = getYouTubeTrailerUrl(trailerModalMovie.title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={closeTrailerModal}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/70 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-[#e50914] flex items-center justify-center border border-rose-500/30">
              <Play className="w-4 h-4 fill-[#e50914]" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                {trailerModalMovie.title} - Official Trailer
              </h3>
              <p className="text-xs text-slate-400">
                {trailerModalMovie.genre} • {trailerModalMovie.release_year}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeTrailerModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
            aria-label="Close trailer modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${trailerModalMovie.title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950">
              <img
                src={trailerModalMovie.image_url}
                alt={trailerModalMovie.title}
                className="absolute inset-0 w-full h-full object-cover blur-md opacity-20"
              />
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30">
                  <Play className="w-8 h-8 fill-rose-500" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  Watch &ldquo;{trailerModalMovie.title}&rdquo; on YouTube
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Click below to watch the high-definition trailer directly on YouTube.
                </p>
                <a
                  href={searchTrailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e50914] hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/40 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Official Trailer</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls & Movie Info */}
        <div className="p-5 sm:p-6 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-2.5">
              {trailerModalMovie.rating !== undefined && trailerModalMovie.rating >= 5 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {trailerModalMovie.rating.toFixed(1)} / 10
                </span>
              )}
              <span className="text-xs text-slate-400">{trailerModalMovie.genre}</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              {trailerModalMovie.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Watchlist Toggle */}
            <button
              type="button"
              onClick={() => toggleWatchlist(trailerModalMovie)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95 ${
                isSaved
                  ? "bg-[#e50914] text-white border border-[#e50914]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>+ Add to List</span>
                </>
              )}
            </button>

            {/* View Details Link */}
            <Link
              href={`/movies/${movieId}`}
              onClick={closeTrailerModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            >
              <span>View Full Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
