"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0b0f19] via-[#080c14] to-black shadow-2xl shadow-rose-950/20 mb-10 group">
      {/* Ambient Blurred Glowing Background from Poster */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={`bg-${movieId}`}
          src={currentMovie.image_url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center blur-3xl opacity-25 scale-125 transform transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {/* Main Content Grid: Left Details + Right Full Poster Showcase */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center p-6 sm:p-10 lg:p-12 min-h-[440px] sm:min-h-[480px]">
        {/* Left Info Column */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center space-y-4 sm:space-y-5">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#e50914] to-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse">
              <Film className="w-3.5 h-3.5" />
              Featured Spotlight
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md">
              {currentMovie.genre}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              {currentMovie.release_year}
            </span>
            {currentMovie.rating && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 shadow-sm shadow-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {currentMovie.rating.toFixed(1)} IMDb
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-xl line-clamp-2">
            {currentMovie.title}
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-2xl text-shadow">
            {currentMovie.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/movies/${movieId}`}
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-600/40 hover:shadow-rose-600/60 hover:scale-[1.03] active:scale-95 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
              <span>Explore Movie & Trailer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Full Poster Showcase Column */}
        <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-center lg:justify-end">
          <Link
            href={`/movies/${movieId}`}
            className="group/poster relative block w-44 sm:w-56 md:w-64 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/10 hover:border-[#e50914] shadow-2xl shadow-black/90 hover:shadow-rose-600/30 transition-all duration-500 hover:scale-105 active:scale-98 cursor-pointer"
          >
            <img
              key={`poster-${movieId}`}
              src={currentMovie.image_url}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/poster:scale-105"
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover/poster:opacity-20 transition-opacity" />

            {/* Quick Play Hover Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
              <div className="w-14 h-14 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-2xl shadow-rose-600/80 scale-90 group-hover/poster:scale-100 transition-transform">
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Carousel Navigation Bar (Bottom Center / Right) */}
      {movies.length > 1 && (
        <div className="relative z-20 px-6 sm:px-10 lg:px-12 pb-6 flex items-center justify-between border-t border-white/5 pt-4">
          {/* Slider Dots */}
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

          {/* Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={prevSlide}
              aria-label="Previous movie"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-extrabold text-slate-200">
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
