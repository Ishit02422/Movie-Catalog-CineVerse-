"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  Star,
  Search,
  ArrowLeft,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  SlidersHorizontal,
  Lock,
  Mail,
  Loader2,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  List,
  Clapperboard,
  Calendar,
  ExternalLink,
  Filter,
  Check,
  Flame,
  Zap,
  Folder,
  FolderOpen,
  LogOut,
  ChevronRight,
  Sliders,
  Play,
  MessageSquare,
  User as UserIcon,
  Upload,
  Image as ImageIcon,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Movie } from "../../types/movie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface GenreCategory {
  id: string;
  name: string;
  icon: string;
}

const GENRE_ICONS: Record<string, string> = {
  Action: "⚡",
  "Sci-Fi": "🚀",
  Drama: "🎭",
  Romance: "❤️",
  Comedy: "😂",
  Thriller: "🔪",
  Crime: "🔍",
  Horror: "👻",
  Animation: "🎨",
  Adventure: "🗺️",
  Fantasy: "🧙‍♂️",
  Mystery: "🔮",
  Family: "👨‍👩‍👧‍👦",
  Biography: "📜",
  History: "🏛️",
  Music: "🎵",
  Documentary: "📹",
  Sport: "🏆",
  War: "⚔️",
  Western: "🤠",
};

const DEFAULT_GENRE_NAMES = [
  "Action",
  "Sci-Fi",
  "Drama",
  "Romance",
  "Comedy",
  "Fantasy",
  "Adventure",
  "Thriller",
  "Crime",
  "Horror",
  "Animation",
];

export interface PosterPreset {
  name: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  poster: string;
  description: string;
}

export const SAMPLE_POSTER_PRESETS: PosterPreset[] = [
  {
    name: "Stree 2",
    title: "Stree 2: Sarkate Ka Aatank",
    genre: "Horror, Comedy",
    year: 2024,
    rating: 8.6,
    poster: "https://upload.wikimedia.org/wikipedia/en/3/3d/Stree_2_poster.jpg",
    description: "After the events of Stree, the town of Chanderi is haunted by a headless entity named Sarkata who abducts progressive women.",
  },
  {
    name: "Kalki 2898 AD",
    title: "Kalki 2898 AD",
    genre: "Sci-Fi, Action",
    year: 2024,
    rating: 8.8,
    poster: "https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg",
    description: "A modern avatar of Vishnu descends to Earth to protect humanity from dark forces in a dystopian future city called Kasi.",
  },
  {
    name: "Pushpa 2",
    title: "Pushpa 2: The Rule",
    genre: "Action, Crime",
    year: 2024,
    rating: 8.9,
    poster: "https://upload.wikimedia.org/wikipedia/en/1/13/Pushpa_2_The_Rule.jpg",
    description: "Pushpa Raj expands his red sandalwood empire while confronting corrupt police officials and rival underworld bosses.",
  },
  {
    name: "Jawan",
    title: "Jawan",
    genre: "Action, Thriller",
    year: 2023,
    rating: 8.4,
    poster: "https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg",
    description: "A former soldier leads a women's team in daring vigilante operations to fight corruption across society.",
  },
  {
    name: "The Conjuring",
    title: "The Conjuring",
    genre: "Horror, Thriller",
    year: 2013,
    rating: 8.7,
    poster: "https://upload.wikimedia.org/wikipedia/en/1/1f/The_Conjuring_poster.jpg",
    description: "Paranormal investigators Ed and Lorraine Warren assist a Rhode Island family terrorized by a malevolent presence.",
  },
  {
    name: "Interstellar",
    title: "Interstellar",
    genre: "Sci-Fi, Adventure",
    year: 2014,
    rating: 9.2,
    poster: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
    description: "A team of space explorers travels through a wormhole near Saturn in search of a new habitable planet for mankind.",
  },
  {
    name: "Animal",
    title: "Animal",
    genre: "Action, Drama",
    year: 2023,
    rating: 8.1,
    poster: "https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg",
    description: "A man's fierce love for his distant father pushes him into a brutal underworld vendetta against dangerous enemies.",
  },
  {
    name: "The Dark Knight",
    title: "The Dark Knight",
    genre: "Action, Crime",
    year: 2008,
    rating: 9.5,
    poster: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg",
    description: "Batman confronts his greatest psychological and physical test when the sadistic mastermind known as the Joker unleashes chaos on Gotham City.",
  },
];

/**
 * Smart URL cleaner that automatically extracts the real direct image URL
 * if a user pastes a Google Image search / redirect URL.
 */
function cleanAndExtractImageUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();

  // If user pasted a Google Search or Google Images result URL
  if (cleaned.includes("google.") && (cleaned.includes("imgurl=") || cleaned.includes("imgrefurl="))) {
    try {
      const parsed = new URL(cleaned);
      const imgUrlParam = parsed.searchParams.get("imgurl");
      if (imgUrlParam) {
        return decodeURIComponent(imgUrlParam);
      }
    } catch {
      const match = cleaned.match(/imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  // If user pasted a Google redirect URL (url?sa=...&url=...)
  if (cleaned.includes("google.") && cleaned.includes("url?")) {
    try {
      const parsed = new URL(cleaned);
      const urlParam = parsed.searchParams.get("url");
      if (urlParam) {
        return decodeURIComponent(urlParam);
      }
    } catch {}
  }

  // Remove surrounding quotes if any
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

/**
 * Compress image file to lightweight Base64 data URL (< 150KB)
 */
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 800;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const { user, token, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();

  // Admin Login State (Empty for secure login)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Movie Management State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedNav, setSelectedNav] = useState<string>("all"); // "all", "featured", or genre name
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating_desc" | "title_asc">("newest");
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [movieReviews, setMovieReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    genre: "Action, Sci-Fi",
    release_year: new Date().getFullYear(),
    rating: 8.5,
    description: "",
    image_url: "",
    is_featured: false,
    status: "active",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [imagePreviewStatus, setImagePreviewStatus] = useState<"idle" | "loading" | "valid" | "error">("idle");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isAdmin = isAuthenticated && user && user.role === "admin";

  // Fetch movies from backend (with status=all so admin sees Active, Hidden, Under Review, Removed)
  const fetchAllMovies = async () => {
    setIsLoadingMovies(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movies?status=all&sort=year_desc`);
      if (res.ok) {
        const data = await res.json();
        const list: Movie[] = data.data || [];
        setMovies(list);
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllMovies();
    }
  }, [isAdmin]);

  // Compute dynamic genre categories list (defaults + any custom genres found in database)
  const genreCategories = useMemo<GenreCategory[]>(() => {
    const dynamicGenreNames = new Set<string>();
    
    // Add default popular genres
    DEFAULT_GENRE_NAMES.forEach((g) => dynamicGenreNames.add(g));

    // Add any genre present in current movies
    movies.forEach((m) => {
      if (m.genre) {
        m.genre.split(/[,/]/).forEach((part) => {
          const clean = part.trim();
          if (clean) {
            // Capitalize first letter properly (e.g., "fantasy" -> "Fantasy")
            const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
            dynamicGenreNames.add(capitalized);
          }
        });
      }
    });

    return Array.from(dynamicGenreNames).map((name) => {
      const matchingKey = Object.keys(GENRE_ICONS).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );
      const icon = matchingKey ? GENRE_ICONS[matchingKey] : "📁";
      return { id: name, name, icon };
    });
  }, [movies]);

  // Compute genre movie counts for sidebar
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    genreCategories.forEach((g) => {
      counts[g.id] = movies.filter((m) =>
        m.genre?.toLowerCase().includes(g.id.toLowerCase())
      ).length;
    });
    return counts;
  }, [movies, genreCategories]);

  const featuredCount = useMemo(() => {
    return movies.filter((m) => m.is_featured).length;
  }, [movies]);

  // Compute status counts for Admin Visibility dashboard
  const statusCounts = useMemo(() => {
    return {
      active: movies.filter((m) => (m.status || "active") === "active").length,
      hidden: movies.filter((m) => m.status === "hidden").length,
      under_review: movies.filter((m) => m.status === "under_review").length,
      removed: movies.filter((m) => m.status === "removed").length,
    };
  }, [movies]);

  // Filtered & Sorted Movies for center details pane
  const displayedMovies = useMemo(() => {
    let result = [...movies];

    if (selectedNav === "featured") {
      result = result.filter((m) => m.is_featured);
    } else if (selectedNav === "status_active") {
      result = result.filter((m) => (m.status || "active") === "active");
    } else if (selectedNav === "status_hidden") {
      result = result.filter((m) => m.status === "hidden");
    } else if (selectedNav === "status_under_review") {
      result = result.filter((m) => m.status === "under_review");
    } else if (selectedNav === "status_removed") {
      result = result.filter((m) => m.status === "removed");
    } else if (selectedNav !== "all") {
      result = result.filter((m) =>
        m.genre?.toLowerCase().includes(selectedNav.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.release_year.toString().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return b.release_year - a.release_year;
      if (sortBy === "oldest") return a.release_year - b.release_year;
      if (sortBy === "rating_desc") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [movies, selectedNav, searchQuery, sortBy]);

  // Toast notification helper
  const showToast = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Admin Login Submit
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      await login({ email: adminEmail, password: adminPassword });
    } catch (err: any) {
      setLoginError(err.message || "Invalid Admin Credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Add Modal trigger
  const handleOpenAddModal = () => {
    setFormData({
      title: "",
      genre: selectedNav !== "all" && selectedNav !== "featured" ? selectedNav : "Action, Sci-Fi",
      release_year: new Date().getFullYear(),
      rating: 8.5,
      description: "",
      image_url: "",
      is_featured: selectedNav === "featured",
      status: "active",
    });
    setFormError("");
    setImagePreviewStatus("idle");
    setIsAddModalOpen(true);
  };

  // Edit Modal trigger
  const handleOpenEditModal = (movie: Movie) => {
    setActiveMovie(movie);
    setFormData({
      title: movie.title,
      genre: movie.genre,
      release_year: movie.release_year,
      rating: movie.rating ?? 8.0,
      description: movie.description,
      image_url: movie.image_url,
      is_featured: !!movie.is_featured,
      status: movie.status || "active",
    });
    setFormError("");
    setImagePreviewStatus(movie.image_url ? "loading" : "idle");
    setIsEditModalOpen(true);
  };

  // Auto clean URL on paste/change
  const handleImageUrlChange = (value: string) => {
    const cleaned = cleanAndExtractImageUrl(value);
    setFormData((prev) => ({ ...prev, image_url: cleaned }));
    setImagePreviewStatus(cleaned ? "loading" : "idle");
  };

  // Local File Upload Handler
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    setIsUploadingImage(true);
    try {
      const base64Data = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, image_url: base64Data }));
      setImagePreviewStatus("valid");
      setFormError("");
    } catch (err) {
      setFormError("Failed to process image file. Please try another image.");
      setImagePreviewStatus("error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 1-Click Preset Selection Handler
  const handleSelectPreset = (preset: PosterPreset) => {
    setFormData((prev) => ({
      ...prev,
      title: prev.title.trim() === "" ? preset.title : prev.title,
      genre: prev.genre.trim() === "" || prev.genre === "Action, Sci-Fi" ? preset.genre : prev.genre,
      release_year: preset.year,
      rating: preset.rating,
      image_url: preset.poster,
      description: prev.description.trim() === "" ? preset.description : prev.description,
    }));
    setImagePreviewStatus("loading");
    setFormError("");
  };

  // Delete Modal trigger
  const handleOpenDeleteModal = (movie: Movie) => {
    setActiveMovie(movie);
    setIsDeleteModalOpen(true);
  };

  // Submit Add Movie
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.title.trim() || !formData.image_url.trim() || !formData.description.trim()) {
      setFormError("Please fill in Title, Poster Image URL, and Description.");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create movie.");
      }

      showToast("success", `✨ "${data.data.title}" added to catalog successfully!`);
      setIsAddModalOpen(false);
      fetchAllMovies();
    } catch (err: any) {
      setFormError(err.message || "Error creating movie.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Movie
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMovie) return;
    setFormError("");

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${activeMovie.id || (activeMovie as any)._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update movie.");
      }

      showToast("success", `✨ "${data.data.title}" updated successfully!`);
      setIsEditModalOpen(false);
      setActiveMovie(null);
      fetchAllMovies();
    } catch (err: any) {
      setFormError(err.message || "Error updating movie.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Delete Movie
  const handleDeleteSubmit = async () => {
    if (!activeMovie) return;
    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${activeMovie.id || (activeMovie as any)._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete movie.");
      }

      showToast("success", `🗑️ Movie "${activeMovie.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setActiveMovie(null);
      fetchAllMovies();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete movie.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (movie: Movie) => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${movie.id || (movie as any)._id}/feature`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          "success",
          data.data.is_featured
            ? `⭐ "${movie.title}" is now Featured on Hero Banner!`
            : `"${movie.title}" removed from Hero Banner.`
        );
        fetchAllMovies();
      } else {
        showToast("error", data.message || "Failed to update featured status.");
      }
    } catch (err: any) {
      showToast("error", "Failed to update featured status.");
    }
  };

  // Open Reviews Inspector Modal
  const handleOpenReviewsModal = async (movie: Movie) => {
    setActiveMovie(movie);
    setIsReviewsModalOpen(true);
    setIsLoadingReviews(true);
    try {
      const movieId = movie.id || (movie as any)._id;
      const res = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setMovieReviews(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load movie reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Delete an individual review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showToast("success", "Audience review deleted.");
        setMovieReviews((prev) => prev.filter((r) => r._id !== reviewId && r.id !== reviewId));
        fetchAllMovies();
      }
    } catch (err) {
      showToast("error", "Failed to delete review.");
    }
  };

  // Quick Status Changer Handler (Active, Hidden, Under Review, Removed)
  const handleUpdateStatus = async (
    movie: Movie,
    newStatus: "active" | "hidden" | "under_review" | "removed"
  ) => {
    try {
      const movieId = movie.id || (movie as any)._id;
      const res = await fetch(`${API_BASE_URL}/movies/${movieId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          "success",
          `✨ "${movie.title}" status updated to ${newStatus.toUpperCase()}!`
        );
        fetchAllMovies();
      } else {
        showToast("error", data.message || "Failed to update movie status.");
      }
    } catch (err: any) {
      showToast("error", "Failed to update movie status.");
    }
  };


  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 text-[#e50914] animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Non-Admin Login Portal
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06090e] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e50914]/15 rounded-full blur-[120px] pointer-events-none" />

        <header className="px-6 py-5 flex items-center justify-between z-10 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e50914] to-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Cine<span className="text-[#e50914]">Verse</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ml-1">
              Studio
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalog</span>
          </Link>
        </header>

        <main className="flex items-center justify-center px-4 py-12 z-10">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e50914] to-rose-700 flex items-center justify-center text-white shadow-xl shadow-rose-600/30">
                <Shield className="w-8 h-8" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-center text-white mb-1.5 tracking-tight">
              Admin Portal Login
            </h1>
            <p className="text-slate-400 text-xs text-center mb-6">
              Enter Administrator credentials to manage CineVerse Catalog.
            </p>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="Enter administrator email..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="Enter administrator password..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Access Studio Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-500 border-t border-white/5">
          CineVerse Admin Studio • Protected System
        </footer>
      </div>
    );
  }

  // 3. Authenticated Master-Detail Layout (Left Sidebar + Center Details)
  const activeTitle =
    selectedNav === "all"
      ? "All Movies Catalog"
      : selectedNav === "featured"
      ? "Hero Banner Featured Movies"
      : selectedNav === "status_active"
      ? "🟢 Active & Published Movies"
      : selectedNav === "status_hidden"
      ? "👁️ Hidden Movies (Private)"
      : selectedNav === "status_under_review"
      ? "🟡 Under Review Movies"
      : selectedNav === "status_removed"
      ? "🔴 Removed / Archived Movies"
      : `${selectedNav} Movies`;

  return (
    <div className="h-screen bg-[#070b12] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Studio Bar */}
      <header className="h-16 shrink-0 border-b border-white/10 bg-[#090e17] px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e50914] to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Cine<span className="text-[#e50914]">Verse</span>
            </span>
          </Link>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Admin Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">View App</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <button
            onClick={logout}
            className="text-xs font-semibold text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container: Left Sidebar + Center Details Pane */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR: CATEGORIES / GENRES / FILE NAVIGATION */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-80 lg:w-96 bg-[#090e18] border-r border-white/10 flex flex-col shrink-0 p-5 sm:p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
          {/* Quick Action: Add Movie Button */}
          <button
            onClick={handleOpenAddModal}
            className="w-full py-4 px-5 bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-base rounded-2xl shadow-xl shadow-rose-600/30 hover:shadow-rose-600/45 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>Add New Movie</span>
          </button>

          {/* Main Navigation Group */}
          <div className="shrink-0">
            <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 mb-3 px-2">
              Catalog Views
            </p>
            <div className="space-y-2">
              {/* All Movies */}
              <button
                onClick={() => setSelectedNav("all")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-extrabold transition-all cursor-pointer ${
                  selectedNav === "all"
                    ? "bg-[#e50914] text-white shadow-lg shadow-rose-600/25 scale-[1.02]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clapperboard className="w-5 h-5 text-white" />
                  <span>All Movies</span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black ${
                  selectedNav === "all" ? "bg-black/40 text-white" : "bg-white/10 text-slate-300"
                }`}>
                  {movies.length}
                </span>
              </button>

              {/* Featured Hero Banner */}
              <button
                onClick={() => setSelectedNav("featured")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-extrabold transition-all cursor-pointer ${
                  selectedNav === "featured"
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className={`w-5 h-5 ${selectedNav === "featured" ? "fill-slate-950 text-slate-950" : "text-amber-400 fill-amber-400"}`} />
                  <span>Hero Banner Featured</span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black ${
                  selectedNav === "featured" ? "bg-black/40 text-slate-950" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}>
                  {featuredCount}
                </span>
              </button>
            </div>
          </div>

          {/* Visibility & Status Filters */}
          <div className="shrink-0 pt-2 border-t border-white/5">
            <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 mb-3 px-2 flex items-center justify-between">
              <span>Status & Visibility</span>
              <ShieldCheck className="w-4.5 h-4.5 text-slate-400" />
            </p>
            <div className="space-y-1.5">
              {/* Active */}
              <button
                onClick={() => setSelectedNav("status_active")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedNav === "status_active"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.01]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                  <span>🟢 Active (Live)</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                  selectedNav === "status_active" ? "bg-black/40 text-white" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {statusCounts.active}
                </span>
              </button>

              {/* Hidden */}
              <button
                onClick={() => setSelectedNav("status_hidden")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedNav === "status_hidden"
                    ? "bg-purple-700 text-white shadow-md shadow-purple-700/30 scale-[1.01]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  <span>👁️ Hidden (Private)</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                  selectedNav === "status_hidden" ? "bg-black/40 text-white" : "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                }`}>
                  {statusCounts.hidden}
                </span>
              </button>

              {/* Under Review */}
              <button
                onClick={() => setSelectedNav("status_under_review")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedNav === "status_under_review"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-[1.01]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>🟡 Under Review</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                  selectedNav === "status_under_review" ? "bg-black/40 text-white" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}>
                  {statusCounts.under_review}
                </span>
              </button>

              {/* Removed */}
              <button
                onClick={() => setSelectedNav("status_removed")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedNav === "status_removed"
                    ? "bg-rose-700 text-white shadow-md shadow-rose-700/30 scale-[1.01]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span>🔴 Removed</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                  selectedNav === "status_removed" ? "bg-black/40 text-white" : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                }`}>
                  {statusCounts.removed}
                </span>
              </button>
            </div>
          </div>

          {/* Genre / Categories Group */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 mb-3 px-2 flex items-center justify-between">
              <span>Categories (Genres)</span>
              <Folder className="w-4.5 h-4.5 text-slate-400" />
            </p>
            <div className="space-y-2">
              {genreCategories.map((cat) => {
                const count = genreCounts[cat.id] || 0;
                const isSelected = selectedNav.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedNav(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white/20 text-white font-black border border-white/25 shadow-md scale-[1.01]"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    <span className={`text-xs sm:text-sm font-black px-3 py-0.5 rounded-xl border ${
                      count > 0 
                        ? "text-slate-200 bg-slate-800/90 border-white/10" 
                        : "text-slate-500 bg-slate-900/50 border-white/5"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 pb-1 border-t border-white/5 text-[11px] text-slate-500 text-center font-medium shrink-0">
            CineVerse Studio • v1.0
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* CENTER / MAIN DETAIL VIEW */}
        {/* ========================================================================= */}
        <main className="flex-1 bg-[#070b13] p-4 sm:p-6 lg:p-8 h-full overflow-y-auto custom-scrollbar">
          {/* Toast Notification */}
          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all animate-fadeIn ${
                statusMessage.type === "success"
                  ? "bg-emerald-950/90 border border-emerald-500/40 text-emerald-100"
                  : "bg-rose-950/90 border border-rose-500/40 text-rose-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className="text-sm font-semibold">{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section Header & Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeTitle}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {displayedMovies.length} Movies
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage details, posters, ratings and featured banner status.
              </p>
            </div>

            {/* View Switcher & Sort Selector */}
            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="newest" className="bg-slate-900">Newest Year</option>
                  <option value="oldest" className="bg-slate-900">Oldest Year</option>
                  <option value="rating_desc" className="bg-slate-900">Top Rated ★</option>
                  <option value="title_asc" className="bg-slate-900">Title (A-Z)</option>
                </select>
              </div>

              {/* View Mode Toggle: Detailed List vs Poster Grid */}
              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("list")}
                  title="Detailed List View"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-[#e50914] text-white shadow-md shadow-rose-600/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  title="Poster Cards Grid"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-[#e50914] text-white shadow-md shadow-rose-600/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar in Detail Pane */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTitle.toLowerCase()} by title, year or category...`}
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all placeholder:text-slate-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* DETAIL VIEW 1: DETAILED MASTER-DETAIL MOVIE ROWS */}
          {/* ========================================================================= */}
          {displayedMovies.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-16 text-center text-slate-400">
              <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No movies found in this view</h3>
              <p className="text-xs text-slate-500 mb-4">Try clearing your search query or add a new movie to this category.</p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-[#e50914] text-white text-xs font-bold rounded-xl"
              >
                + Add Movie to {selectedNav === "all" ? "Catalog" : selectedNav}
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-3">
              {displayedMovies.map((movie) => {
                const movieId = movie.id || (movie as any)._id;
                const movieStatus = movie.status || "active";
                return (
                  <div
                    key={movieId}
                    className="bg-slate-900/75 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 group shadow-md"
                  >
                    {/* Left Details: Poster + Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-20 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-white/10 shadow-md relative">
                        <img
                          src={movie.image_url}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80";
                          }}
                        />
                        {movie.is_featured && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 shadow">
                            <Star className="w-2.5 h-2.5 fill-slate-950" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-white text-base group-hover:text-rose-400 transition-colors truncate">
                            {movie.title}
                          </h4>
                          <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                            {movie.release_year}
                          </span>
                          <span className="text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                            {movie.genre}
                          </span>
                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                              movieStatus === "active"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : movieStatus === "hidden"
                                ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                : movieStatus === "under_review"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {movieStatus === "active"
                              ? "🟢 Active"
                              : movieStatus === "hidden"
                              ? "👁️ Hidden"
                              : movieStatus === "under_review"
                              ? "🟡 Under Review"
                              : "🔴 Removed"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 pr-2">
                          {movie.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <button
                            onClick={() => handleOpenReviewsModal(movie)}
                            className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/20 transition-all cursor-pointer"
                            title="View Audience Reviews"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{movie.rating?.toFixed(1) || "8.0"} / 10</span>
                            <span className="text-[10px] text-slate-400 ml-1">(Reviews)</span>
                          </button>
                          <span>•</span>
                          <span className={movie.is_featured ? "text-amber-400 font-semibold" : "text-slate-500"}>
                            {movie.is_featured ? "⭐ Featured on Hero" : "Standard Catalog"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right In-line Action Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end flex-wrap">
                      {/* Quick Status Changer Dropdown */}
                      <select
                        value={movieStatus}
                        onChange={(e) => handleUpdateStatus(movie, e.target.value as any)}
                        className={`text-xs font-extrabold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer focus:outline-none ${
                          movieStatus === "active"
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:border-emerald-500"
                            : movieStatus === "hidden"
                            ? "bg-purple-950/80 text-purple-300 border-purple-500/40 hover:border-purple-500"
                            : movieStatus === "under_review"
                            ? "bg-amber-950/80 text-amber-300 border-amber-500/40 hover:border-amber-500"
                            : "bg-rose-950/80 text-rose-300 border-rose-500/40 hover:border-rose-500"
                        }`}
                        title="Change Visibility Status"
                      >
                        <option value="active" className="bg-slate-900 text-emerald-400 font-bold">🟢 Active (Live)</option>
                        <option value="hidden" className="bg-slate-900 text-purple-300 font-bold">👁️ Hidden (Private)</option>
                        <option value="under_review" className="bg-slate-900 text-amber-400 font-bold">🟡 Under Review</option>
                        <option value="removed" className="bg-slate-900 text-rose-400 font-bold">🔴 Removed</option>
                      </select>

                      {/* Reviews Inspector Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenReviewsModal(movie)}
                        title="Inspect User Reviews & Comments"
                        className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                        <span className="hidden lg:inline">Reviews</span>
                      </button>

                      {/* Feature Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(movie)}
                        title={movie.is_featured ? "Remove from Hero Banner" : "Feature on Hero Banner"}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          movie.is_featured
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                            : "bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${movie.is_featured ? "fill-amber-400" : ""}`} />
                        <span>{movie.is_featured ? "Featured" : "Feature"}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(movie)}
                        title="Edit Movie Details"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleOpenDeleteModal(movie)}
                        title="Delete Movie"
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* DETAIL VIEW 2: POSTER CARDS GRID */
            /* ========================================================================= */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedMovies.map((movie) => {
                const movieId = movie.id || (movie as any)._id;
                const movieStatus = movie.status || "active";
                return (
                  <div
                    key={movieId}
                    className="group relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-rose-500/40 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[2/3] w-full bg-slate-950 overflow-hidden relative">
                      <img
                        src={movie.image_url}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80";
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(movie)}
                        title={movie.is_featured ? "Remove from Hero Banner" : "Feature on Hero Banner"}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          movie.is_featured
                            ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                            : "bg-black/60 text-slate-400 hover:text-amber-400"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${movie.is_featured ? "fill-slate-950" : ""}`} />
                      </button>

                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] font-black text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{movie.rating?.toFixed(1) || "8.0"}</span>
                      </div>

                      {/* Status Tag on Poster */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-md border shadow-md ${
                            movieStatus === "active"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                              : movieStatus === "hidden"
                              ? "bg-purple-950/80 text-purple-200 border-purple-500/40"
                              : movieStatus === "under_review"
                              ? "bg-amber-950/80 text-amber-200 border-amber-500/40"
                              : "bg-rose-950/80 text-rose-200 border-rose-500/40"
                          }`}
                        >
                          {movieStatus === "active"
                            ? "🟢 Active"
                            : movieStatus === "hidden"
                            ? "👁️ Hidden"
                            : movieStatus === "under_review"
                            ? "🟡 Review"
                            : "🔴 Removed"}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3 gap-2">
                        <button
                          onClick={() => handleOpenEditModal(movie)}
                          className="flex-1 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(movie)}
                          className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between bg-slate-900/90">
                      <div>
                        <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-rose-400 transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {movie.release_year} • <span className="text-slate-300 font-medium">{movie.genre?.split(/[,/|]/)[0]}</span>
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-white/5 space-y-2">
                        {/* Quick Status Select on Grid Card */}
                        <select
                          value={movieStatus}
                          onChange={(e) => handleUpdateStatus(movie, e.target.value as any)}
                          className={`w-full text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer focus:outline-none ${
                            movieStatus === "active"
                              ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/30"
                              : movieStatus === "hidden"
                              ? "bg-purple-950/70 text-purple-300 border-purple-500/30"
                              : movieStatus === "under_review"
                              ? "bg-amber-950/70 text-amber-300 border-amber-500/30"
                              : "bg-rose-950/70 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          <option value="active" className="bg-slate-900 text-emerald-400">🟢 Active (Live)</option>
                          <option value="hidden" className="bg-slate-900 text-purple-300">👁️ Hidden (Private)</option>
                          <option value="under_review" className="bg-slate-900 text-amber-400">🟡 Under Review</option>
                          <option value="removed" className="bg-slate-900 text-rose-400">🔴 Removed</option>
                        </select>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            movie.is_featured
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {movie.is_featured ? "⭐ Featured" : "Standard"}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(movie)}
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(movie)}
                              className="text-slate-400 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ADD MOVIE MODAL (With Live Cinema Poster Preview) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e50914] to-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Add New Movie</h2>
                  <p className="text-xs text-slate-400">Publish a new blockbuster to CineVerse catalog</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Movie Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Inception"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Genre *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        placeholder="Action, Sci-Fi"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Release Year *
                      </label>
                      <input
                        type="number"
                        required
                        min={1888}
                        max={2030}
                        value={formData.release_year}
                        onChange={(e) => setFormData({ ...formData, release_year: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Visibility Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all font-semibold cursor-pointer"
                      >
                        <option value="active" className="bg-slate-900 text-emerald-400 font-bold">🟢 Active (Live)</option>
                        <option value="hidden" className="bg-slate-900 text-purple-300 font-bold">👁️ Hidden (Private)</option>
                        <option value="under_review" className="bg-slate-900 text-amber-400 font-bold">🟡 Under Review</option>
                        <option value="removed" className="bg-slate-900 text-rose-400 font-bold">🔴 Removed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Rating: <span className="text-amber-400 font-extrabold">{formData.rating} ★</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full accent-[#e50914] cursor-pointer"
                    />
                  </div>

                  {/* Poster Image Section with Pure File Upload & Quick Presets */}
                  <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#e50914]" />
                        <span>Poster Image *</span>
                      </label>
                      {formData.image_url && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Image Selected
                        </span>
                      )}
                    </div>

                    {/* Dedicated Clickable File Upload Area */}
                    <label
                      className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        formData.image_url
                          ? "border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500/60"
                          : "border-white/20 bg-slate-950/60 hover:border-[#e50914] hover:bg-rose-950/10"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif"
                        onChange={handleImageFileUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-[#e50914]/20 flex items-center justify-center text-white group-hover:text-[#e50914] transition-all">
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#e50914]" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                            {isUploadingImage
                              ? "Optimizing & Processing Image..."
                              : formData.image_url
                              ? "📁 Click to Choose / Change Poster from Device"
                              : "📁 Click to Upload Poster from Device"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Supports PNG, JPG, JPEG, WEBP (Auto-optimized)
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Remove button if image is selected */}
                    {formData.image_url && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, image_url: "" }));
                            setImagePreviewStatus("idle");
                          }}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
                        >
                          <X className="w-3 h-3" /> Remove poster
                        </button>
                      </div>
                    )}

                    {/* Quick Working Sample Presets */}
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>⚡ Or 1-Click Auto-Fill Sample Blockbuster:</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                        {SAMPLE_POSTER_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-white hover:border-rose-500/40 border border-white/10 transition-all cursor-pointer active:scale-95"
                            title={`Click to auto-fill with ${p.title}`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Synopsis / Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write a captivating plot description..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Live Cinema Poster Preview */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Live Poster Preview
                  </p>
                  <div className="w-36 aspect-[2/3] rounded-xl bg-slate-900 overflow-hidden border border-white/15 shadow-xl relative group">
                    {formData.image_url ? (
                      <>
                        <img
                          src={formData.image_url}
                          alt="Poster Preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onLoad={() => setImagePreviewStatus("valid")}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/400x600/1e293b/ef4444?text=Invalid+Image+URL";
                            setImagePreviewStatus("error");
                          }}
                        />
                        {/* Status Overlay Badge */}
                        <div className="absolute top-2 right-2">
                          {imagePreviewStatus === "valid" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[10px] font-black shadow backdrop-blur-sm">
                              <Check className="w-3 h-3 stroke-[3]" /> OK
                            </span>
                          )}
                          {imagePreviewStatus === "error" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black shadow">
                              <X className="w-3 h-3 stroke-[3]" /> Error
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-600">
                        <Film className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Enter URL or Upload to Preview</span>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-2 text-center">
                    {formData.image_url ? (
                      imagePreviewStatus === "valid" ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 justify-center">
                          <CheckCircle className="w-3.5 h-3.5" /> Poster Ready
                        </span>
                      ) : imagePreviewStatus === "error" ? (
                        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-3.5 h-3.5" /> Link not working
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Loading preview...</span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-500">No image chosen</span>
                    )}
                  </div>

                  <div className="mt-4 w-full">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Hero Banner Feature</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Movie</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MOVIE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Edit Movie Details</h2>
                  <p className="text-xs text-slate-400">Modifying: <span className="text-white font-bold">{activeMovie.title}</span></p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Movie Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Genre *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Release Year *
                      </label>
                      <input
                        type="number"
                        required
                        min={1888}
                        max={2030}
                        value={formData.release_year}
                        onChange={(e) => setFormData({ ...formData, release_year: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Visibility Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914] transition-all font-semibold cursor-pointer"
                      >
                        <option value="active" className="bg-slate-900 text-emerald-400 font-bold">🟢 Active (Live)</option>
                        <option value="hidden" className="bg-slate-900 text-purple-300 font-bold">👁️ Hidden (Private)</option>
                        <option value="under_review" className="bg-slate-900 text-amber-400 font-bold">🟡 Under Review</option>
                        <option value="removed" className="bg-slate-900 text-rose-400 font-bold">🔴 Removed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Rating: <span className="text-amber-400 font-extrabold">{formData.rating} ★</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full accent-[#e50914] cursor-pointer"
                    />
                  </div>

                  {/* Poster Image Section with Pure File Upload & Quick Presets */}
                  <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#e50914]" />
                        <span>Poster Image *</span>
                      </label>
                      {formData.image_url && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Image Loaded
                        </span>
                      )}
                    </div>

                    {/* Dedicated Clickable File Upload Area */}
                    <label
                      className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        formData.image_url
                          ? "border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500/60"
                          : "border-white/20 bg-slate-950/60 hover:border-[#e50914] hover:bg-rose-950/10"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif"
                        onChange={handleImageFileUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-[#e50914]/20 flex items-center justify-center text-white group-hover:text-[#e50914] transition-all">
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#e50914]" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                            {isUploadingImage
                              ? "Optimizing & Processing Image..."
                              : formData.image_url
                              ? "📁 Click to Choose / Change Poster from Device"
                              : "📁 Click to Upload Poster from Device"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Supports PNG, JPG, JPEG, WEBP (Auto-optimized)
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Remove button if image is selected */}
                    {formData.image_url && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, image_url: "" }));
                            setImagePreviewStatus("idle");
                          }}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
                        >
                          <X className="w-3 h-3" /> Remove poster
                        </button>
                      </div>
                    )}

                    {/* Quick Working Sample Presets */}
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>⚡ Or 1-Click Auto-Fill Sample Blockbuster:</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                        {SAMPLE_POSTER_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-white hover:border-rose-500/40 border border-white/10 transition-all cursor-pointer active:scale-95"
                            title={`Click to set poster to ${p.title}`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Synopsis / Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Poster Preview */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Poster Preview
                  </p>
                  <div className="w-36 aspect-[2/3] rounded-xl bg-slate-900 overflow-hidden border border-white/15 shadow-xl relative group">
                    {formData.image_url ? (
                      <>
                        <img
                          src={formData.image_url}
                          alt="Poster Preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onLoad={() => setImagePreviewStatus("valid")}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://placehold.co/400x600/1e293b/ef4444?text=Invalid+Image+URL";
                            setImagePreviewStatus("error");
                          }}
                        />
                        {/* Status Overlay Badge */}
                        <div className="absolute top-2 right-2">
                          {imagePreviewStatus === "valid" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[10px] font-black shadow backdrop-blur-sm">
                              <Check className="w-3 h-3 stroke-[3]" /> OK
                            </span>
                          )}
                          {imagePreviewStatus === "error" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black shadow">
                              <X className="w-3 h-3 stroke-[3]" /> Error
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-600">
                        <Film className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Enter URL or Upload to Preview</span>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-2 text-center">
                    {formData.image_url ? (
                      imagePreviewStatus === "valid" ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 justify-center">
                          <CheckCircle className="w-3.5 h-3.5" /> Poster Ready
                        </span>
                      ) : imagePreviewStatus === "error" ? (
                        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-3.5 h-3.5" /> Link not working
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Loading preview...</span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-500">No image chosen</span>
                    )}
                  </div>

                  <div className="mt-4 w-full">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Hero Banner Feature</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#e50914] to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-7 shadow-2xl">
            <div className="flex items-center justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg">
                <Trash2 className="w-7 h-7" />
              </div>
            </div>

            <h3 className="text-xl font-black text-center text-white mb-2 tracking-tight">
              Delete Movie?
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="text-white font-bold">"{activeMovie.title}"</span>{" "}
              from the CineVerse catalog? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={formSubmitting}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                {formSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Delete Movie</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIENCE REVIEWS INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {isReviewsModalOpen && activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 font-black">
                  <Star className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Audience Reviews & Ratings
                  </h3>
                  <p className="text-xs text-slate-400">
                    Movie: <span className="text-white font-bold">{activeMovie.title}</span> • Overall: <span className="text-amber-400 font-bold">{activeMovie.rating?.toFixed(1) || "8.0"} ★</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reviews List Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {isLoadingReviews ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span>Loading audience ratings and comments...</span>
                </div>
              ) : movieReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-950/50 rounded-2xl border border-white/5">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-400">No Audience Reviews Yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">When users rate this movie on the details page, their reviews will appear here.</p>
                </div>
              ) : (
                movieReviews.map((rev: any) => {
                  const reviewId = rev._id || rev.id;
                  return (
                    <div
                      key={reviewId}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 hover:border-white/10 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* User Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-rose-800 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                          {rev.user_avatar ? (
                            <img src={rev.user_avatar} alt={rev.user_name} className="w-full h-full rounded-full object-cover" />
                          ) : rev.user_name ? (
                            rev.user_name.charAt(0).toUpperCase()
                          ) : (
                            <UserIcon className="w-4 h-4" />
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">{rev.user_name || "Anonymous Member"}</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= (rev.rating || 5) ? "fill-amber-400" : "text-slate-600"}`}
                                />
                              ))}
                              <span className="text-[11px] font-bold text-amber-400 ml-1">({rev.rating}/5 ★)</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                            "{rev.comment}"
                          </p>

                          <p className="text-[10px] text-slate-500 mt-1.5">
                            Submitted on {new Date(rev.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Delete Inappropriate Review Button */}
                      <button
                        onClick={() => handleDeleteReview(reviewId)}
                        title="Delete this review as Admin"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Total Reviews: <b className="text-white">{movieReviews.length}</b></span>
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

