"use client";

import React, { useEffect } from "react";
import { X, Play, ExternalLink, Sparkles, Star, Calendar, Film, Maximize2 } from "lucide-react";
import { Movie } from "../types/movie";
import { getYouTubeEmbedUrl, getYouTubeTrailerUrl } from "../utils/trailerMap";

interface TrailerModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  movie,
  onClose,
}) => {
  // Listen for ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const embedUrl = getYouTubeEmbedUrl(movie.title);
  const externalYouTubeUrl = getYouTubeTrailerUrl(movie.title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/60 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e50914] to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-white truncate">
                  {movie.title}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  Official Trailer
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{movie.genre}</span>
                <span>•</span>
                <span>{movie.release_year}</span>
                {movie.rating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={externalYouTubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all border border-red-500/50 cursor-pointer shadow-md shadow-red-900/40 hover:scale-105"
              title="Open video directly on YouTube"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
              title="Close Player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded 16:9 Video Player or Cinema Showcase Card */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movie.title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center group">
              {movie.image_url && (
                <img
                  src={movie.image_url}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center brightness-25 scale-105 group-hover:scale-110 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />

              <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Official Cinema Trailer • Full HD
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {movie.title}
                </h4>
                <a
                  href={externalYouTubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Play Trailer on YouTube</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Info */}
        <div className="p-5 sm:p-6 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl line-clamp-2">
            {movie.description}
          </p>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              1080p Full HD • Dolby Sound
            </span>
            <a
              href={`/movies/${movie.id || (movie as any)._id}`}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Movie Page &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
