"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Movie } from "../types/movie";
import { Star, Calendar, Film, ArrowRight, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";

interface HeroBannerProps {
  movies: Movie[];
  onPlayTrailer?: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onPlayTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 7 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const movieId = currentMovie.id || currentMovie._id;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-slate-950 shadow-2xl shadow-black/80 mb-12 group">
      {/* Background Poster Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={`bg-${movieId}`}
          src={currentMovie.image_url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center blur-3xl opacity-30 scale-125 transform transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060911] via-[#060911]/85 to-transparent" />
      </div>

      {/* Main Content Layout: Left Details + Right Complete Full Poster */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center p-8 sm:p-12 lg:p-14 min-h-[480px]">
        {/* Left Column: Movie Info */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-5">
          {/* Badges Row with larger, readable fonts */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-[#e50914] to-rose-600 text-white shadow-lg shadow-rose-600/40">
              <Sparkles className="w-4 h-4" />
              Featured Premiere
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-slate-900/90 text-slate-100 border border-slate-700 backdrop-blur-md">
              {currentMovie.genre}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900/80 border border-slate-800">
              <Calendar className="w-4 h-4 text-rose-400" />
              {currentMovie.release_year}
            </span>
            {currentMovie.rating !== undefined && currentMovie.rating >= 5 && currentMovie.rating <= 10 && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {currentMovie.rating.toFixed(1)} / 10
              </span>
            )}
          </div>

          {/* Title with larger, bolder typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg font-sans">
            {currentMovie.title}
          </h1>

          {/* Description with larger readable text */}
          <p className="text-slate-300 text-base sm:text-lg line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-3xl">
            {currentMovie.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            {onPlayTrailer && (
              <button
                type="button"
                onClick={() => onPlayTrailer(currentMovie)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-base shadow-2xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-rose-400/40"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}

            <Link
              href={`/movies/${movieId}`}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 hover:border-slate-500 shadow-xl transition-all duration-200 cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Poster Card Artwork */}
        <div className="hidden md:flex md:col-span-4 items-center justify-center lg:justify-end">
          <Link
            href={`/movies/${movieId}`}
            className="group/card relative block w-52 sm:w-60 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/20 shadow-2xl shadow-black hover:border-[#e50914] transition-all duration-300 hover:scale-105"
          >
            <img
              key={`poster-${movieId}`}
              src={currentMovie.image_url}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white font-bold text-sm flex items-center gap-2">
                <Play className="w-4 h-4 fill-white" />
                Explore Now
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Carousel Controls with larger buttons and slide indicator */}
      {movies.length > 1 && (
        <div className="relative z-20 px-8 sm:px-12 pb-6 flex items-center justify-between border-t border-white/10 pt-4 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            {movies.map((m, idx) => (
              <button
                key={m.id || (m as any)._id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-10 bg-gradient-to-r from-[#e50914] to-rose-500 shadow-md shadow-rose-600/60"
                    : "w-2.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              aria-label="Previous movie"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm font-extrabold text-slate-200 tracking-wider">
              {currentIndex + 1} / {movies.length}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Next movie"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
