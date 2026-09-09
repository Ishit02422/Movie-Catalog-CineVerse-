"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Movie } from "../types/movie";
import { Star, Calendar, Film, ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface HeroBannerProps {
  movies: Movie[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies }) => {
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
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/90 bg-[#090d16] shadow-2xl shadow-rose-950/20 mb-10 group">
      {/* Background Poster: Blurred Cinematic Ambient Glow (eliminates cropped half-faces) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={`bg-${movieId}`}
          src={currentMovie.image_url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center blur-2xl opacity-35 scale-125 transform transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/80 to-transparent" />
      </div>

      {/* Main Content Layout: Left Details + Right Complete Full Poster */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-10 lg:p-12 min-h-[420px] sm:min-h-[460px]">
        {/* Left Column: Movie Info */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col justify-center space-y-4">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#e50914] to-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Film className="w-3.5 h-3.5" />
              Featured
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md">
              {currentMovie.genre}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              {currentMovie.release_year}
            </span>
            {currentMovie.rating !== undefined && currentMovie.rating >= 5 && currentMovie.rating <= 10 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {currentMovie.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {currentMovie.title}
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-2xl text-shadow">
            {currentMovie.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <Link
              href={`/movies/${movieId}`}
              className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-rose-600/35 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Complete Full Poster Artwork (No faces cut off!) */}
        <div className="hidden md:flex md:col-span-4 lg:col-span-4 items-center justify-center lg:justify-end">
          <Link
            href={`/movies/${movieId}`}
            className="group/card relative block w-44 sm:w-52 lg:w-60 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl shadow-black/90 hover:border-[#e50914] transition-all duration-300 hover:scale-105"
          >
            <img
              key={`poster-${movieId}`}
              src={currentMovie.image_url}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>

      {/* Carousel Controls */}
      {movies.length > 1 && (
        <div className="relative z-20 px-6 sm:px-10 lg:px-12 pb-5 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            {movies.map((m, idx) => (
              <button
                key={m.id || (m as any)._id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-8 bg-gradient-to-r from-[#e50914] to-rose-500 shadow-md shadow-rose-600/50"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous movie"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
              {currentIndex + 1} / {movies.length}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Next movie"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
