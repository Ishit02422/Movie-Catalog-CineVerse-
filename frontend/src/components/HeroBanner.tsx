"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Movie } from "../types/movie";
import { Star, Calendar, Film, ArrowRight, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
import { getYouTubeTrailerUrl } from "../utils/trailerMap";

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

  const handleOpenTrailer = () => {
    window.open(getYouTubeTrailerUrl(currentMovie.title), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-slate-950 shadow-xl shadow-black/60 mb-8 group">
      {/* Background Poster Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={`bg-${movieId}`}
          src={currentMovie.image_url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center blur-3xl opacity-25 scale-125 transform transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060911] via-[#060911]/85 to-transparent" />
      </div>

      {/* Main Content Layout: Left Details + Right Complete Full Poster */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 items-center p-6 sm:p-8 lg:p-12 min-h-[360px] sm:min-h-[420px]">
        {/* Left Column: Movie Info */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-4">
          {/* Badges Row with clean, readable fonts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#e50914] to-rose-600 text-white shadow-md shadow-rose-600/30">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Premiere
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-100 border border-slate-700/80 backdrop-blur-md">
              {currentMovie.genre}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              {currentMovie.release_year}
            </span>
            {currentMovie.rating !== undefined && currentMovie.rating >= 5 && currentMovie.rating <= 10 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {currentMovie.rating.toFixed(1)} / 10
              </span>
            )}
          </div>

          {/* Title with sleek, bold typography */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md font-sans">
            {currentMovie.title}
          </h1>

          {/* Description with balanced readable text */}
          <p className="text-slate-300/90 text-xs sm:text-sm md:text-base line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-3xl font-normal">
            {currentMovie.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenTrailer}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/40 hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer border border-rose-400/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Trailer</span>
            </button>

            <Link
              href={`/movies/${movieId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700/80 hover:border-slate-600 shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Poster Card Artwork */}
        <div className="hidden md:flex md:col-span-4 items-center justify-center lg:justify-end">
          <Link
            href={`/movies/${movieId}`}
            className="group/card relative block w-44 sm:w-52 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl shadow-black hover:border-[#e50914] transition-all duration-300 hover:scale-103"
          >
            <img
              key={`poster-${movieId}`}
              src={currentMovie.image_url}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-3.5">
              <span className="text-white font-semibold text-xs flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-white" />
                Explore Now
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Carousel Controls */}
      {movies.length > 1 && (
        <div className="relative z-20 px-6 sm:px-8 py-3 flex items-center justify-between border-t border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2">
            {movies.map((m, idx) => (
              <button
                key={m.id || (m as any)._id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-8 bg-gradient-to-r from-[#e50914] to-rose-500 shadow-sm"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous movie"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-bold text-slate-200 tracking-wider">
              {currentIndex + 1} / {movies.length}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Next movie"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
