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
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-2xl shadow-rose-950/20 mb-10">
      {/* Background Poster / Backdrop with Rich Gradients */}
      <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full">
        <img
          src={currentMovie.image_url}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-[center_20%] transition-all duration-700 brightness-60 scale-105"
        />

        {/* Gradient overlays for cinema look */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-12 max-w-3xl z-10 space-y-4">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500 text-white shadow-lg shadow-rose-500/30">
              <Film className="w-3.5 h-3.5" />
              Featured
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 backdrop-blur-md">
              {currentMovie.genre}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentMovie.release_year}
            </span>
            {currentMovie.rating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20">
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
          <p className="text-slate-300 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl text-shadow">
            {currentMovie.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <Link
              href={`/movies/${movieId}`}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Controls */}
        {movies.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous movie"
              className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
              {currentIndex + 1} / {movies.length}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Next movie"
              className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
