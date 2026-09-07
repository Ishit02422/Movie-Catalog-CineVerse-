"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Movie } from "../../../types/movie";
import { fetchMovieById } from "../../../lib/api";
import { Navbar } from "../../../components/Navbar";
import { MovieCard } from "../../../components/MovieCard";
import { useWatchlist } from "../../../context/WatchlistContext";
import { useAuth } from "../../../context/AuthContext";
import {
  ArrowLeft,
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
  X,
  ExternalLink,
} from "lucide-react";
import { getMovieTrailerVideoId, getYouTubeSearchUrl } from "../../../utils/trailerMap";

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
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user, token, isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Review Form state
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Trailer Modal state
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

  const isSaved = movie ? isInWatchlist(movie.id || (movie as any)._id) : false;

  // Track recently viewed in localStorage (keyed by active user)
  const trackRecentlyViewed = useCallback((m: Movie) => {
    if (typeof window === "undefined") return;
    try {
      const userKey = user?.id
        ? `cineverse_recently_viewed_${user.id}`
        : "cineverse_recently_viewed_guest";
      const stored = localStorage.getItem(userKey);
      let list: Movie[] = stored ? JSON.parse(stored) : [];
      const currentId = m.id || (m as any)._id;
      list = list.filter((item) => (item.id || (item as any)._id) !== currentId);
      list.unshift(m);
      if (list.length > 12) list = list.slice(0, 12);
      localStorage.setItem(userKey, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to store recently viewed:", e);
    }
  }, [user?.id]);

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

  useEffect(() => {
    if (!id) return;

    async function loadMovieDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMovieById(id);
        if (!data) {
          setError("Movie not found. The movie ID might be invalid or deleted.");
        } else {
          setMovie(data);
          trackRecentlyViewed(data);
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
  }, [id, trackRecentlyViewed, loadSimilarMovies, loadReviews]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

    if (!reviewComment.trim()) {
      setReviewMessage("Please write a short comment for your review.");
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
          comment: reviewComment.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to submit review.");
      }

      setReviewComment("");
      setReviewMessage("🎉 Your review has been posted successfully!");
      // Reload reviews and movie to update average score
      await loadReviews(id);
      const updatedMovie = await fetchMovieById(id);
      if (updatedMovie) setMovie(updatedMovie);
    } catch (err: any) {
      setReviewMessage(err.message || "Failed to post review.");
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
        await loadReviews(id);
        const updatedMovie = await fetchMovieById(id);
        if (updatedMovie) setMovie(updatedMovie);
      }
    } catch (e) {
      console.error("Failed to delete review:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Sticky Header */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-500">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95 group text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Movies</span>
          </Link>

          {movie && (
            <div className="flex items-center gap-3">
              {/* Add to Watchlist Button */}
              <button
                type="button"
                onClick={handleWatchlistToggle}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95 ${
                  isSaved
                    ? "bg-[#e50914] text-white border-[#e50914] shadow-red-950/50"
                    : "bg-slate-900/80 hover:bg-[#e50914] text-slate-200 hover:text-white border-slate-800 hover:border-[#e50914]"
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
                    <span>+ My List</span>
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-medium transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-400" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 animate-pulse">
            <div className="aspect-[2/3] rounded-3xl bg-slate-900 border border-slate-800/80" />
            <div className="md:col-span-2 space-y-6 pt-4">
              <div className="h-6 w-28 bg-slate-800 rounded-full" />
              <div className="h-10 w-3/4 bg-slate-800 rounded-xl" />
              <div className="h-4 w-full bg-slate-900 rounded" />
              <div className="h-4 w-5/6 bg-slate-900 rounded" />
              <div className="h-4 w-2/3 bg-slate-900 rounded" />
            </div>
          </div>
        )}

        {/* Error / 404 Not Found State */}
        {!isLoading && (error || !movie) && (
          <div className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/40 p-12 text-center space-y-6 max-w-xl mx-auto my-12 backdrop-blur-xl">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {error || "The movie you are looking for does not exist or has been removed."}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Explore All Movies</span>
            </Link>
          </div>
        )}

        {/* Main Movie Content */}
        {!isLoading && movie && (
          <div className="space-y-12">
            {/* Main Header / Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Poster Column */}
              <div className="md:col-span-4 lg:col-span-4">
                <div className="relative aspect-[2/3] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-2xl shadow-rose-950/30 group">
                  <Image
                    src={imageError ? fallbackImage : movie.image_url}
                    alt={movie.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />

                  {/* Play Trailer Overlay Button */}
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Info Column */}
              <div className="md:col-span-8 lg:col-span-8 space-y-6">
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#e50914] text-white shadow-md shadow-red-950/40">
                    {movie.genre}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    Released {movie.release_year}
                  </span>
                  {movie.rating && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {movie.rating.toFixed(1)} / 10 IMDb
                    </span>
                  )}
                </div>

                {/* Movie Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {movie.title}
                </h1>

                {/* Star Rating Bar */}
                {movie.rating && (
                  <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl w-fit">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const normalizedRating = movie.rating! / 2; // out of 5
                        const isFilled = star <= Math.floor(normalizedRating);
                        const isHalf = !isFilled && star === Math.ceil(normalizedRating) && (normalizedRating % 1 >= 0.4);
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
                    <span className="text-xs font-semibold text-slate-300">
                      Community Rating: <strong className="text-white">{movie.rating.toFixed(1)}</strong>/10
                    </span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWatchlistToggle}
                    className={`px-5 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                      isSaved
                        ? "bg-[#e50914] text-white border-[#e50914] shadow-md shadow-red-950/40"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700"
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? "Saved in My List" : "Add to Watchlist"}</span>
                  </button>
                </div>

                {/* Overview / Description */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Film className="w-4 h-4 text-rose-400" />
                    Synopsis
                  </h3>
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                    {movie.description}
                  </p>
                </div>

                {/* Quick Spec Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Film className="w-3.5 h-3.5 text-rose-400" />
                      <span>Genre</span>
                    </div>
                    <p className="text-sm font-bold text-white">{movie.genre}</p>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Release Year</span>
                    </div>
                    <p className="text-sm font-bold text-white">{movie.release_year}</p>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Popularity</span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {movie.views_count ? `${movie.views_count.toLocaleString()} Views` : "Trending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION: SIMILAR MOVIES ("MORE LIKE THIS")                                */}
            {/* ========================================================================= */}
            {similarMovies.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-rose-400" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      More Like This
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">Based on {movie.genre}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {similarMovies.slice(0, 4).map((simMovie) => (
                    <MovieCard key={simMovie.id || (simMovie as any)._id} movie={simMovie} />
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION: RATINGS & REVIEWS                                                */}
            {/* ========================================================================= */}
            <section className="space-y-8 pt-8 border-t border-slate-900">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#e50914]" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Audience Reviews &amp; Ratings ({reviews.length})
                </h2>
              </div>

              {/* Review Submission Form */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">
                  {isAuthenticated ? "Leave your Rating & Review" : "Sign in to leave a review"}
                </h3>

                {reviewMessage && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Interactive Star Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Your Rating (1 to 5 Stars):</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-600 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              (hoverRating || userRating) >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-700"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-sm font-bold text-amber-300 ml-2">
                        {userRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-1.5">
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={
                        isAuthenticated
                          ? "Share your thoughts on the acting, plot, visuals, or soundtrack..."
                          : "Please log in from the top right to write a review."
                      }
                      disabled={!isAuthenticated}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-rose-500 focus:outline-none placeholder:text-slate-600 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isAuthenticated ? `Posting as ${user?.name || "Member"}` : "Guest Mode"}
                    </span>
                    <button
                      type="submit"
                      disabled={!isAuthenticated || isSubmittingReview || !reviewComment.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/50"
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
              <div className="space-y-3.5">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 text-center">
                    No reviews yet. Be the first to share your thoughts on this movie!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
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
                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
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
                          </div>

                          {/* Delete button if owner or admin */}
                          {user && (user.id === rev.user || user.role === "admin") && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              title="Delete review"
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
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

      {/* Enhanced Cinema Trailer Video Player Modal */}
      {isTrailerOpen && movie && (() => {
        const trailerId = getMovieTrailerVideoId(movie.title);
        const youtubeSearchUrl = getYouTubeSearchUrl(movie.title);
        return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
            <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-rose-950/60 flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e50914] to-rose-700 flex items-center justify-center text-white shadow-md">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight leading-tight line-clamp-1">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Official Cinema Trailer • Full HD</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={youtubeSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#e50914] text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
                    title="Open on YouTube in new tab"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Player / Fallback Content */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {trailerId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${movie.title} Official Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-black via-slate-950/90 to-slate-900">
                    <div className="w-16 h-16 rounded-full bg-[#e50914]/20 border border-rose-500/30 flex items-center justify-center text-[#e50914] mb-4 shadow-xl shadow-rose-950/50 animate-pulse">
                      <Play className="w-8 h-8 fill-[#e50914] translate-x-0.5" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-1">
                      {movie.title} Official Trailer
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                      Watch the high-definition trailer and exclusive behind-the-scenes footage directly on YouTube.
                    </p>
                    <a
                      href={youtubeSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-sm shadow-xl shadow-rose-600/40 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>▶️ Play Official Trailer on YouTube</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-950 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-400" />
                  <span>{movie.genre} • {movie.release_year} • {movie.rating?.toFixed(1) || "8.0"} ★</span>
                </span>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Screen in YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-slate-400">
            CineVerse Movie Catalog Application &copy; {new Date().getFullYear()}
          </p>
          <p>Built with Next.js, TypeScript, Tailwind CSS, Node.js & MongoDB.</p>
        </div>
      </footer>
    </div>
  );
}
