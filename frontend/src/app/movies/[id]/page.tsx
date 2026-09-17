"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Movie } from "../../../types/movie";
import { fetchMovieById } from "../../../lib/api";
import { Navbar } from "../../../components/Navbar";
import { MovieCard } from "../../../components/MovieCard";
import { useWatchlist } from "../../../context/WatchlistContext";
import { useAuth } from "../../../context/AuthContext";
import { useMovieStore } from "../../../context/MovieContext";
import { useToast } from "../../../context/ToastContext";
import {
  Star,
  Calendar,
  Film,
  Eye,
  Bookmark,
  Check,
  Share2,
  AlertCircle,
  Home,
  MessageSquare,
  Trash2,
  Send,
  Sparkles,
  Play,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface ReviewItem {
  id: string;
  user: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://movie-catalog-cineverse.onrender.com/api"
    : "http://localhost:5000/api");

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user, token, isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { recordRecentlyViewed, openTrailerModal } = useMovieStore();
  const { showToast } = useToast();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Review Form state
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const fallbackImage =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

  const isSaved = movie ? isInWatchlist(movie.id || (movie as any)._id) : false;

  const handleOpenTrailer = () => {
    if (movie) {
      openTrailerModal(movie);
    }
  };

  // Fetch reviews
  const loadReviews = useCallback(async (movieId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
      }
    } catch (e) {
      console.warn("Failed to load reviews:", e);
    }
  }, []);

  // Fetch similar movies
  const loadSimilarMovies = useCallback(async (movieId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${movieId}/similar`);
      if (res.ok) {
        const data = await res.json();
        setSimilarMovies(data.data || []);
      }
    } catch (e) {
      console.warn("Failed to load similar movies:", e);
    }
  }, []);

  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (fetchedIdRef.current === id) return;
    fetchedIdRef.current = id;

    async function loadMovieDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMovieById(id);
        if (!data) {
          setError("Movie not found. The movie ID might be invalid or deleted.");
        } else {
          setMovie(data);
          recordRecentlyViewed(data);
          loadSimilarMovies(id);
          loadReviews(id);
        }
      } catch (err: any) {
        console.error("Failed to load movie details:", err);
        setError(err.message || "Failed to load movie details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMovieDetails();
  }, [id, recordRecentlyViewed, loadSimilarMovies, loadReviews]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("success", "Movie link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackToDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    await toggleWatchlist(movie);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      setReviewMessage("Please sign in to submit a rating and review.");
      return;
    }

    if (!userRating || userRating < 1 || userRating > 5) {
      setReviewMessage("⚠️ Please select your rating by clicking 1 to 5 stars.");
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (trimmedComment.length < 10) {
      setReviewMessage("⚠️ Review comment must be at least 10 characters long.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/movies/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: userRating,
          comment: trimmedComment,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to submit review.");
      }

      setReviewComment("");
      setUserRating(0);
      setReviewMessage("🎉 Your review has been posted successfully!");
      showToast("success", "Your review and rating have been posted! ⭐");

      // Reload reviews and movie to update average score
      await loadReviews(id);
      const updatedMovie = await fetchMovieById(id);
      if (updatedMovie) setMovie(updatedMovie);
    } catch (err: any) {
      setReviewMessage(err.message || "Failed to post review.");
      showToast("error", err.message || "Failed to post review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("info", "Audience review deleted.");
        await loadReviews(id);
        const updatedMovie = await fetchMovieById(id);
        if (updatedMovie) setMovie(updatedMovie);
      }
    } catch (e) {
      console.error("Failed to delete review:", e);
      showToast("error", "Failed to delete review.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white font-sans">
      {/* Sticky Top Header */}
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-10 sm:space-y-12 animate-in fade-in duration-500">
        {/* Breadcrumb Navigation & Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-400">{movie?.genre || "Movie"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold truncate max-w-[200px] sm:max-w-xs">
              {movie?.title || "Details"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {movie && (
              <>
                <button
                  type="button"
                  onClick={handleWatchlistToggle}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95 ${
                    isSaved
                      ? "bg-[#e50914] text-white border-[#e50914] shadow-rose-950/50"
                      : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>In My List</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>+ Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 animate-pulse bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12">
            <div className="md:col-span-5 lg:col-span-4 aspect-[2/3] max-w-[340px] rounded-2xl bg-slate-800" />
            <div className="md:col-span-7 lg:col-span-8 space-y-5 pt-4">
              <div className="h-6 w-32 bg-slate-800 rounded-full" />
              <div className="h-12 w-3/4 bg-slate-800 rounded-2xl" />
              <div className="h-4 w-full bg-slate-800/60 rounded" />
              <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
              <div className="h-4 w-2/3 bg-slate-800/60 rounded" />
              <div className="flex gap-3 pt-4">
                <div className="h-12 w-40 bg-slate-800 rounded-xl" />
                <div className="h-12 w-36 bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (error || !movie) && (
          <div className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/40 p-12 text-center space-y-4 max-w-lg mx-auto my-12 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-xl shadow-rose-500/10">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Movie Not Found</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {error || "The movie you are looking for does not exist or has been removed."}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e50914] hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Explore All Movies</span>
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN CINEMATIC SHOWCASE BILLBOARD HERO                                    */}
        {/* ========================================================================= */}
        {!isLoading && movie && (
          <div className="space-y-12">
            <div className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-[#080c18] to-slate-950 p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* Cinematic Ambient Backdrop Glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={imageError ? fallbackImage : (movie.image_url || fallbackImage)}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover object-center blur-3xl opacity-25 scale-125 transform transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060911] via-[#060911]/90 to-transparent" />
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Left Column: 3D Poster Artwork with Trailer Overlay Button */}
                <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-start">
                  <div className="relative aspect-[2/3] w-full max-w-[300px] sm:max-w-[360px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl shadow-black/90 group">
                    <img
                      src={imageError ? fallbackImage : (movie.image_url || fallbackImage)}
                      alt={movie.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50" />

                    {/* Center Pulsing Play Trailer Button */}
                    <button
                      type="button"
                      onClick={handleOpenTrailer}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#e50914] hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-600/60 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 group/btn"
                      title="Watch Official Trailer"
                    >
                      <Play className="w-7 h-7 fill-white translate-x-0.5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Rich Typography & Details */}
                <div className="md:col-span-7 lg:col-span-8 space-y-6">
                  {/* Badges & Meta Row */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#e50914] text-white shadow-md shadow-rose-950/40">
                      {movie.genre}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      Released {movie.release_year}
                    </span>
                    {movie.rating !== undefined && movie.rating >= 5 && movie.rating <= 10 && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {movie.rating.toFixed(1)} / 10 IMDb
                      </span>
                    )}
                  </div>

                  {/* Large Cinematic Title */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md font-sans">
                    {movie.title}
                  </h1>

                  {/* Rating Score Banner */}
                  {movie.rating !== undefined && movie.rating >= 5 && movie.rating <= 10 && (
                    <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 p-3 rounded-2xl w-fit">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const normalizedRating = movie.rating! / 2; // out of 5
                          const isFilled = star <= Math.floor(normalizedRating);
                          const isHalf =
                            !isFilled &&
                            star === Math.ceil(normalizedRating) &&
                            normalizedRating % 1 >= 0.4;
                          return (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                isFilled
                                  ? "fill-amber-400 text-amber-400"
                                  : isHalf
                                  ? "fill-amber-400/50 text-amber-400"
                                  : "text-slate-700"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-300">
                        Audience Score: <strong className="text-white">{movie.rating.toFixed(1)}</strong>/10 • {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  )}

                  {/* CTA Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-1">
                    <button
                      type="button"
                      onClick={handleOpenTrailer}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-600/40 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-102 active:scale-98"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Watch Official Trailer</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWatchlistToggle}
                      className={`px-5 py-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 cursor-pointer transition-all active:scale-98 ${
                        isSaved
                          ? "bg-[#e50914] text-white border-[#e50914] shadow-lg shadow-rose-950"
                          : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700"
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
                      <span>{isSaved ? "Saved in My List" : "+ Add to Watchlist"}</span>
                    </button>
                  </div>

                  {/* Synopsis / Story */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-rose-400" />
                      Storyline &amp; Overview
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-3xl">
                      {movie.description}
                    </p>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Film className="w-3.5 h-3.5 text-rose-400" />
                        <span>Genre</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{movie.genre}</p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Release Year</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">{movie.release_year}</p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Popularity</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {movie.views_count ? `${movie.views_count.toLocaleString()} Views` : "Trending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION: SIMILAR MOVIES ("MORE LIKE THIS")                                */}
            {/* ========================================================================= */}
            {similarMovies.length > 0 && (
              <section className="space-y-6 pt-8 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        More Like This
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Similar movies based on <strong className="text-slate-200">{movie.genre}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 sm:gap-6">
                  {similarMovies.slice(0, 7).map((simMovie) => (
                    <MovieCard
                      key={simMovie.id || (simMovie as any)._id}
                      movie={simMovie}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION: RATINGS & AUDIENCE REVIEWS STUDIO                                 */}
            {/* ========================================================================= */}
            <section className="space-y-8 pt-8 border-t border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[#e50914]">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Audience Reviews &amp; Ratings ({reviews.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Share your verdict and explore what other movie lovers think
                  </p>
                </div>
              </div>

              {/* Review Submission Form Studio */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-5 backdrop-blur-xl">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isAuthenticated ? "Rate this Movie & Leave a Review" : "Sign in to leave a review"}
                </h3>

                {reviewMessage && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
                      reviewMessage.includes("successfully")
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {reviewMessage.includes("successfully") ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{reviewMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Interactive Star Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Select Your Rating *
                      </label>
                      {/* Dynamic Live Emotion Badge */}
                      {(hoverRating || userRating) > 0 ? (
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
                            (hoverRating || userRating) === 1
                              ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                              : (hoverRating || userRating) === 2
                              ? "text-orange-400 bg-orange-500/10 border-orange-500/30"
                              : (hoverRating || userRating) === 3
                              ? "text-yellow-300 bg-yellow-500/10 border-yellow-500/30"
                              : (hoverRating || userRating) === 4
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              : "text-amber-300 bg-amber-500/15 border-amber-500/30"
                          }`}
                        >
                          <span>
                            {(hoverRating || userRating) === 1
                              ? "😡"
                              : (hoverRating || userRating) === 2
                              ? "😕"
                              : (hoverRating || userRating) === 3
                              ? "😐"
                              : (hoverRating || userRating) === 4
                              ? "😊"
                              : "🤩"}
                          </span>
                          <span>
                            {hoverRating || userRating} / 5 •{" "}
                            {(hoverRating || userRating) === 1
                              ? "Poor"
                              : (hoverRating || userRating) === 2
                              ? "Fair"
                              : (hoverRating || userRating) === 3
                              ? "Good"
                              : (hoverRating || userRating) === 4
                              ? "Very Good"
                              : "Masterpiece"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Click a star to rate
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 w-fit">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeStar = (hoverRating || userRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-slate-600 hover:scale-125 active:scale-95 transition-all cursor-pointer rounded-lg hover:bg-white/5"
                            title={`${star} Star`}
                          >
                            <Star
                              className={`w-7 h-7 transition-all ${
                                activeStar
                                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                  : "text-slate-700 hover:text-slate-500"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <textarea
                        rows={3}
                        maxLength={250}
                        value={reviewComment}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.startsWith(" ")) val = val.trimStart();
                          val = val.replace(/\s{2,}/g, " ");
                          if (val.length <= 250) {
                            setReviewComment(val);
                            if (reviewMessage) setReviewMessage(null);
                          }
                        }}
                        placeholder={
                          isAuthenticated
                            ? "Write your movie review here (e.g. story, acting, direction, cinematography)..."
                            : "Please log in from the top right to write a review."
                        }
                        disabled={!isAuthenticated}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none placeholder:text-slate-500 disabled:opacity-50 transition-all resize-none shadow-inner"
                      />
                      {isAuthenticated && (
                        <div className="absolute right-3 bottom-2.5 pointer-events-none text-[11px] font-mono text-slate-500">
                          {reviewComment.trim().length} / 250
                        </div>
                      )}
                    </div>

                    {/* Real-time character guide */}
                    {isAuthenticated && reviewComment.length > 0 && reviewComment.trim().length < 10 && (
                      <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                        <span>ℹ️ Minimum 10 characters required</span>
                        <span>({10 - reviewComment.trim().length} more needed)</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 font-medium">
                      {isAuthenticated ? `Posting as ${user?.name || "Member"}` : "Guest Mode (Sign in required)"}
                    </span>
                    <button
                      type="submit"
                      disabled={
                        !isAuthenticated ||
                        isSubmittingReview ||
                        userRating === 0 ||
                        reviewComment.trim().length < 10
                      }
                      className="px-6 py-3 rounded-xl bg-[#e50914] hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-rose-950/50"
                    >
                      {isSubmittingReview ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                    <h4 className="text-base font-bold text-white">No Reviews Yet</h4>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                      Be the first to share your thoughts on this movie with the CineVerse community!
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3 transition-all hover:border-slate-700 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e50914] to-rose-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
                            {rev.user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{rev.user_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(rev.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Star Rating Display */}
                          <div className="flex items-center gap-0.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-800"
                                }`}
                              />
                            ))}
                            <span className="text-xs font-bold text-amber-300 ml-1.5">
                              {rev.rating}/5
                            </span>
                          </div>

                          {/* Delete button only for admin */}
                          {user && user.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              title="Delete review (Admin only)"
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-12">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 text-center text-sm text-slate-400 mt-16">
        <div className="w-full px-4 sm:px-8 lg:px-12 space-y-2">
          <p className="font-bold text-white text-base">
            CineVerse Movie Catalog Application &copy; {new Date().getFullYear()}
          </p>
          <p className="text-slate-400">Built with Next.js, TypeScript, Tailwind CSS, Node.js & MongoDB.</p>
        </div>
      </footer>
    </div>
  );
}
