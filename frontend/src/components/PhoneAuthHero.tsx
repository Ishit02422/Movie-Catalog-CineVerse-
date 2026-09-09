"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { Movie } from "../types/movie";
import {
  Film,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Tv,
  Download,
  Smartphone,
  Users,
  Plus,
  Minus,
  Star,
  Flame,
} from "lucide-react";

interface PhoneAuthHeroProps {
  sampleMovies?: Movie[];
}

const FALLBACK_POSTERS = [
  "https://image.tmdb.org/t/p/original/em39H81XLCDgXsI7V4IcBZseEO6.jpg", // Yeh Jawaani Hai Deewani
  "https://image.tmdb.org/t/p/original/sQ7A7jyTbkK90vjd8yCRuoyL9CK.jpg", // Jab We Met
  "https://image.tmdb.org/t/p/original/zhMI6I0kSLnewTMwE0A8Tz3Cj2f.jpg", // Kal Ho Naa Ho
  "https://image.tmdb.org/t/p/original/66A9MqXOyVFCssoloscw79z8Tew.jpg", // 3 Idiots
  "https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg", // Dangal
  "https://image.tmdb.org/t/p/original/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg", // Inception
  "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // The Dark Knight
  "https://www.tallengestore.com/cdn/shop/products/Interstellar_-_Tallenge_Hollywood_Sci-Fi_Art_Movie_Poster_Collection_6400e127-641e-4478-8a06-f699ae526fad.jpg", // Interstellar
  "https://upload.wikimedia.org/wikipedia/en/f/f3/Aashiqui_2_%28Poster%29.jpg", // Aashiqui 2
  "https://image.tmdb.org/t/p/original/5cJIx2zKjDoUtPSliou23xsReb1.jpg", // Barfi!
  "https://image.tmdb.org/t/p/original/wE0I6efAW4cDDmZQWtwZMOW44EJ.jpg", // RRR
  "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", // Dune 2
  "https://image.tmdb.org/t/p/original/21sC2assImQIYCEDA84Qh9d1RsK.jpg", // Baahubali 2
  "https://image.tmdb.org/t/p/original/2CAL2433ZeIihfX1Hb2139CX0pW.jpg", // DDLJ
  "https://image.tmdb.org/t/p/original/zGvFnwoXJKrYnKhoVPytqkqCJ8V.jpg", // Shershaah
  "https://www.tallengestore.com/cdn/shop/products/Oppenheimer-CillianMurphy-ChristopherNolan-HollywoodMoviePoster_e0f44b57-75a5-4a51-a4e9-65f9f9a49106.jpg?v=1691369035", // Oppenheimer
  "https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Parasite
  "https://image.tmdb.org/t/p/original/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", // Spider-Man
  "https://image.tmdb.org/t/p/original/cJZC9riwrdATBUonkZJZD6y9g40.jpg", // Rockstar
  "https://image.tmdb.org/t/p/original/oHysAhhXCfm1RYKIb68FJbRNPu6.jpg", // PK
];

const CAROUSEL_SLIDES = [
  {
    title: "Unlimited entertainment, one low price",
    subtitle: "All of CineVerse, starting at just ₹149. Watch anywhere, cancel anytime.",
  },
  {
    title: "Download your shows to watch offline",
    subtitle: "Save your favorites easily and always have something to watch.",
  },
  {
    title: "Watch everywhere",
    subtitle: "Stream on your phone, tablet, laptop, and TV without extra charges.",
  },
  {
    title: "Create profiles for kids",
    subtitle: "Send kids on adventures with their favorite characters in a space made just for them.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is CineVerse?",
    a: "CineVerse is a premium movie streaming catalog offering a rich collection of award-winning Bollywood blockbusters, Hollywood masterpieces, romantic hits, and regional cinema.",
  },
  {
    q: "How much does CineVerse cost?",
    a: "Watch CineVerse on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₹149 to ₹649 a month. No extra costs, no contracts.",
  },
  {
    q: "Where can I watch?",
    a: "Watch anywhere, anytime. Sign in with your CineVerse account to watch instantly on the web at cineverse.com from your personal computer or on any internet-connected device.",
  },
  {
    q: "How do I sign in with Phone OTP?",
    a: "Simply enter your 10-digit mobile number, click Continue, and you will receive a secure 6-digit verification passcode. Enter the code to instantly access your movie library.",
  },
  {
    q: "What can I watch on CineVerse?",
    a: "CineVerse has an extensive library of feature films, documentaries, award-winners, and curated Bollywood classics like Yeh Jawaani Hai Deewani, Jab We Met, 3 Idiots, Dangal, Interstellar, Oppenheimer, and much more.",
  },
];

export const PhoneAuthHero: React.FC<PhoneAuthHeroProps> = ({ sampleMovies = [] }) => {
  const { checkUser, sendPhoneOtp, verifyPhoneOtp, loginWithGoogle } = useAuth();

  // Screen state: "landing" (Photo 1) | "signin" (Photo 2) | "otp"
  const [screen, setScreen] = useState<"landing" | "signin" | "otp">("landing");
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Form states
  const [identifier, setIdentifier] = useState<string>(""); // Email or Mobile number
  const [existingUser, setExistingUser] = useState<{ name?: string; first_name?: string; surname?: string; phone?: string; email?: string } | null>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [receivedDevOtp, setReceivedDevOtp] = useState<string | null>(null);

  // Auto cycle carousel slides on landing screen
  useEffect(() => {
    if (screen !== "landing") return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [screen]);

  // Extract poster URLs for background wall
  const posters = sampleMovies.length > 0
    ? sampleMovies.map((m) => m.image_url).filter(Boolean)
    : FALLBACK_POSTERS;

  // Strict Realistic Human Name Validator (Anti-spam & Anti-gibberish)
  const validateName = (raw: string, fieldLabel: "First Name" | "Last Name"): string | null => {
    const name = raw.trim();
    if (!name) return `Please enter your ${fieldLabel}.`;
    if (name.length < 2) return `${fieldLabel} must be at least 2 characters long.`;
    if (name.length > 20) return `${fieldLabel} must be 20 characters or less.`;
    if (!/^[A-Za-z]+$/.test(name)) {
      return `${fieldLabel} can only contain English letters (A-Z, a-z). Numbers and symbols are not allowed.`;
    }
    // Anti-spam: No 3+ consecutive identical characters (e.g. "aaaa" or "llllll")
    if (/(.)\1{2,}/i.test(name)) {
      return `${fieldLabel} contains repeated letters (e.g. "${name.slice(0, 8)}..."). Please enter a valid name.`;
    }
    // Realistic human name: Must contain at least one vowel (a, e, i, o, u, y)
    if (!/[aeiouyAEIOUY]/.test(name)) {
      return `Please enter a realistic ${fieldLabel} (must contain vowels).`;
    }
    return null;
  };

  // Handle Continue from Screen 2 or Landing input
  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const rawVal = identifier.trim().replace(/\s+/g, "");

    // If user clicked Get Started on landing page with an empty input
    if (screen === "landing" && !rawVal) {
      setAuthMode("register");
      setScreen("signin");
      return;
    }

    let val = rawVal;

    // Validate name fields only if explicitly on screen 2 in register mode
    if (screen !== "landing" && authMode === "register") {
      const firstError = validateName(firstName, "First Name");
      if (firstError) {
        setError(firstError);
        return;
      }

      const lastError = validateName(surname, "Last Name");
      if (lastError) {
        setError(lastError);
        return;
      }
    }

    if (!val) {
      setError("Please enter your email address or 10-digit mobile number.");
      return;
    }

    const isNum = /^[0-9+ -]+$/.test(val);
    const cleanPhone = val.replace(/\D/g, "");

    if (isNum) {
      if (cleanPhone.length !== 10) {
        setError("Mobile number must be exactly 10 digits.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError("Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.");
        return;
      }
      val = cleanPhone;
    } else {
      let emailCandidate = val.includes("@") ? val.toLowerCase() : `${val.toLowerCase()}@gmail.com`;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailCandidate)) {
        setError("Please enter a valid email address (e.g. name@gmail.com).");
        return;
      }
      val = emailCandidate;
      setIdentifier(emailCandidate);
    }

    setIsLoading(true);

    try {
      if (screen === "landing") {
        // Smart Landing Flow: Send OTP without forced mode to auto-detect existing vs new user
        const sendRes = await sendPhoneOtp(val);
        setReceivedDevOtp(sendRes.dev_otp || null);

        if (sendRes.exists) {
          // Existing User -> Auto Sign In OTP Screen
          setAuthMode("signin");
          if (sendRes.user_name) {
            setExistingUser({ name: sendRes.user_name });
          }
          if (isNum) {
            setSuccessMessage(`Welcome back! Verification code sent via SMS to +91-${cleanPhone.slice(-10)}`);
          } else {
            setSuccessMessage(`Welcome back! Verification code sent to ${val.toLowerCase()}`);
          }
          setScreen("otp");
          setOtpCode("");
        } else {
          // New User -> Open Sign Up Screen with pre-filled identifier to collect name
          setAuthMode("register");
          setExistingUser(null);
          setScreen("signin");
        }
      } else {
        // Explicit Screen 2 Flow (Sign In tab or Sign Up tab)
        const sendRes = await sendPhoneOtp(val, authMode);
        if (sendRes.user_name) {
          setExistingUser({ name: sendRes.user_name });
        } else {
          setExistingUser(null);
        }
        setReceivedDevOtp(sendRes.dev_otp || null);

        if (isNum) {
          setSuccessMessage(`Verification code sent via SMS to +91-${cleanPhone.slice(-10)}`);
        } else {
          setSuccessMessage(`Verification code sent to ${val.toLowerCase()}`);
        }

        setScreen("otp");
        setOtpCode("");
      }
    } catch (err: any) {
      console.error("Auth flow notice:", err);
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const isNum = /^[0-9+ -]+$/.test(identifier.trim());
    const cleanVal = isNum ? identifier.trim().replace(/\D/g, "") : identifier.trim().toLowerCase();

    if (!otpCode || otpCode.trim().length < 4) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (authMode === "register") {
      const firstError = validateName(firstName, "First Name");
      if (firstError) {
        setError(firstError);
        return;
      }
      const lastError = validateName(surname, "Last Name");
      if (lastError) {
        setError(lastError);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (authMode === "signin") {
        await verifyPhoneOtp(cleanVal, otpCode.trim(), { mode: "signin" });
      } else {
        await verifyPhoneOtp(cleanVal, otpCode.trim(), {
          first_name: firstName.trim(),
          surname: surname.trim(),
          gender: gender,
          name: `${firstName.trim()} ${surname.trim()}`.trim(),
          mode: "register",
        });
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.message || "Invalid OTP code. Please enter the correct code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP helper
  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await sendPhoneOtp(identifier.trim());
      setReceivedDevOtp(res.dev_otp || null);
      setSuccessMessage(`A fresh verification code has been dispatched!`);
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle One-click Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* ========================================================================= */}
      {/* SCREEN 1: LANDING / WELCOME VIEW (Full-Bodied Netflix Experience)         */}
      {/* ========================================================================= */}
      {screen === "landing" && (
        <div className="relative w-full flex flex-col">
          {/* Top Sticky Header */}
          <header className="relative z-30 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-5 flex items-center justify-between">
            {/* Red CineVerse Logo with 3D Emblem */}
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md shadow-rose-600/30 border border-white/20">
                <img src="/logo.png" alt="CineVerse Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans drop-shadow-md">
                Cine<span className="text-[#e50914]">Verse</span>
              </span>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold tracking-wide">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="text-white/80 hover:text-white uppercase transition-colors cursor-pointer hidden sm:inline"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode("signin");
                  setScreen("signin");
                }}
                className="px-3.5 sm:px-4 py-1.5 rounded-lg border border-white/20 hover:border-white/50 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 hover:bg-white/10"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode("register");
                  setScreen("signin");
                }}
                className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#b80710] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md shadow-red-950/50 active:scale-95"
              >
                Sign Up
              </button>
            </div>
          </header>

          {/* Hero Section with Poster Wall Background */}
          <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center -mt-20 pt-24 pb-16 overflow-hidden">
            {/* High-Density Movie Posters Wall Grid */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-55">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 p-3 scale-110 transform -translate-y-8 animate-in fade-in duration-1000">
                {[...posters, ...posters].slice(0, 32).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-900 shadow-xl shadow-black/90 border border-white/5"
                  >
                    <img
                      src={imgUrl}
                      alt="Movie poster"
                      className="w-full h-full object-cover object-center"
                      loading={idx < 8 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                  </div>
                ))}
              </div>

              {/* Cinematic Vignette Overlays & Radial Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.15)_0%,rgba(0,0,0,0.9)_70%)]" />
            </div>

            {/* Foreground Main Hero Box */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
              {/* Dynamic Carousel Headlines */}
              <div className="min-h-[140px] sm:min-h-[160px] flex flex-col justify-center space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] drop-shadow-2xl">
                  {CAROUSEL_SLIDES[activeSlide].title}
                </h1>
                <p className="text-base sm:text-xl lg:text-2xl text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                  {CAROUSEL_SLIDES[activeSlide].subtitle}
                </p>
              </div>

              {/* 4 Pagination Dots */}
              <div className="flex items-center justify-center gap-2 py-1">
                {CAROUSEL_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`transition-all duration-300 cursor-pointer ${activeSlide === i
                        ? "w-7 h-2 rounded-full bg-[#e50914] scale-105"
                        : "w-2 h-2 rounded-full bg-white/40 hover:bg-white/70"
                      }`}
                  />
                ))}
              </div>

              {/* Inline Input + Get Started CTA Bar */}
              <div className="max-w-xl mx-auto pt-2">
                <p className="text-xs sm:text-sm text-slate-300 mb-3 font-normal">
                  Ready to watch? Enter your email or mobile number to create your CineVerse membership.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAuthMode("register");
                    handleContinue(e);
                  }}
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 w-full"
                >
                  <div className="relative w-full sm:flex-1">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/\s+/g, "");
                        setIdentifier(sanitized);
                        if (error) setError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Email or mobile number"
                      className="w-full px-4 py-3.5 sm:py-4 rounded-md bg-black/80 border border-slate-600 focus:border-white focus:ring-1 focus:ring-white text-white text-base placeholder:text-slate-400 outline-none backdrop-blur-md transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md bg-[#e50914] hover:bg-[#b80710] active:scale-[0.98] text-white font-bold text-base sm:text-lg tracking-wide transition-all duration-200 shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Get Started</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: TRENDING NOW POSTER ROW                                        */}
          {/* ========================================================================= */}
          <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-slate-900">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-[#e50914]" />
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Trending Now on CineVerse
                </h2>
              </div>
              <span className="text-xs text-slate-400">Top 10 in India Today</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {posters.slice(0, 6).map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setScreen("signin")}
                  className="group relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-[#e50914] transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-red-950/40"
                >
                  <img
                    src={imgUrl}
                    alt="Trending Movie"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: MORE REASONS TO JOIN (4 Feature Cards)                         */}
          {/* ========================================================================= */}
          <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-slate-900">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              More Reasons to Join
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#e50914] flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Enjoy on your TV</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Download your shows</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Save your favorites easily and always have something to watch offline on the go.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Watch everywhere</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Create profiles for kids</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Send kids on adventures with their favorite characters in a space made just for them.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ)                               */}
          {/* ========================================================================= */}
          <section className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 border-t border-slate-900 space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold text-white text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {openFaq === idx ? (
                      <Minus className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {openFaq === idx && (
                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 animate-in fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTA Bar */}
            <div className="text-center pt-8 space-y-4">
              <p className="text-xs sm:text-sm text-slate-300">
                Ready to watch? Enter your email or mobile number to create or restart your membership.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-lg mx-auto">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\s+/g, "");
                    setIdentifier(sanitized);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Email or mobile number"
                  className="w-full px-4 py-3.5 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:border-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-sm whitespace-nowrap transition-colors cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full border-t border-slate-900 py-10 px-4 sm:px-8 text-xs text-slate-500 space-y-4">
            <div className="max-w-7xl mx-auto space-y-4">
              <p className="text-slate-400">Questions? Call 000-800-919-1694</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                <a href="#" className="hover:underline">FAQ</a>
                <a href="#" className="hover:underline">Help Centre</a>
                <a href="#" className="hover:underline">Account</a>
                <a href="#" className="hover:underline">Media Centre</a>
                <a href="#" className="hover:underline">Terms of Use</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Cookie Preferences</a>
                <a href="#" className="hover:underline">Corporate Information</a>
              </div>
              <p className="text-[10px] text-slate-600 pt-4">
                CineVerse Movie Streaming &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: READY TO WATCH / SIGN IN / SIGN UP VIEW                        */}
      {/* ========================================================================= */}
      {screen === "signin" && (
        <div className="relative min-h-screen w-full flex flex-col justify-between bg-black overflow-hidden">
          {/* Ambient Cinema Posters Backdrop */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 p-3 scale-110 transform -translate-y-8 blur-[1px]">
              {[...posters, ...posters].slice(0, 32).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-900 border border-white/5"
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/90" />
          </div>

          {/* Top Bar with Back Arrow & Red Logo */}
          <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScreen("landing");
                }}
                className="p-2 -ml-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Back to Welcome"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-rose-600/30 border border-white/15">
                <img src="/logo.png" alt="CineVerse" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                Cine<span className="text-[#e50914]">Verse</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-xs text-white/70 hover:text-white transition-colors uppercase cursor-pointer"
            >
              Privacy
            </button>
          </header>

          {/* Centered Glassmorphic Auth Card */}
          <main className="relative z-10 flex-1 w-full max-w-[460px] mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
            <div className="relative w-full p-7 sm:p-9 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.85)] space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

              {/* Segmented Switcher Tabs: Sign In vs Sign Up */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setError(null);
                  }}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === "signin"
                      ? "bg-gradient-to-r from-[#e50914] to-[#b80710] text-white shadow-md shadow-red-950/50"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setError(null);
                  }}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === "register"
                      ? "bg-gradient-to-r from-[#e50914] to-[#b80710] text-white shadow-md shadow-red-950/50"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {authMode === "signin" ? "Sign In to CineVerse" : "Create Your Account"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {authMode === "signin"
                    ? "Welcome back! Enter your details to receive an instant passcode."
                    : "Join CineVerse today. Enter your details to start streaming."}
                </p>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                  {authMode === "signin" && (error.toLowerCase().includes("no account") || error.toLowerCase().includes("sign up")) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setError(null);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
                    >
                      📝 Click Here to Sign Up (New Account)
                    </button>
                  )}
                  {authMode === "register" && (error.toLowerCase().includes("already exists") || error.toLowerCase().includes("sign in")) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setError(null);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
                    >
                      🔑 Click Here to Sign In (Existing User)
                    </button>
                  )}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleContinue} className="space-y-3.5">
                {authMode === "register" && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">First Name *</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^A-Za-z]/g, "");
                            setFirstName(sanitized);
                            if (error) setError(null);
                          }}
                          onKeyDown={(e) => {
                            if (
                              !/^[A-Za-z]$/.test(e.key) &&
                              !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          placeholder="e.g. Rahul"
                          maxLength={20}
                          autoComplete="given-name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-white text-sm placeholder:text-slate-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Last Name *</label>
                        <input
                          type="text"
                          value={surname}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^A-Za-z]/g, "");
                            setSurname(sanitized);
                            if (error) setError(null);
                          }}
                          onKeyDown={(e) => {
                            if (
                              !/^[A-Za-z]$/.test(e.key) &&
                              !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          placeholder="e.g. Sharma"
                          maxLength={20}
                          autoComplete="family-name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-white text-sm placeholder:text-slate-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-white text-sm outline-none cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {authMode === "register" && (
                    <label className="text-[11px] font-semibold text-slate-300">Email or Mobile Number *</label>
                  )}
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/\s+/g, "");
                      setIdentifier(sanitized);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                    placeholder={
                      authMode === "signin"
                        ? "Email or mobile number"
                        : "Enter your email or 10-digit mobile"
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-white text-sm placeholder:text-slate-400 outline-none transition-all font-medium"
                    autoFocus={authMode === "signin"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b80710] hover:from-[#f40612] hover:to-[#c70812] disabled:opacity-60 text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-200 active:scale-[0.98] shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>
                      {authMode === "signin" ? "Sign In with OTP" : "Sign Up & Send Code"}
                    </span>
                  )}
                </button>
              </form>

              {/* Switch Mode Footer Toggle */}
              <div className="text-center text-xs text-slate-400 pt-1">
                {authMode === "signin" ? (
                  <p>
                    New to CineVerse?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setError(null);
                      }}
                      className="text-white hover:underline font-bold cursor-pointer ml-1"
                    >
                      Sign up now.
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setError(null);
                      }}
                      className="text-white hover:underline font-bold cursor-pointer ml-1"
                    >
                      Sign in now.
                    </button>
                  </p>
                )}
              </div>

              {/* Google Button */}
              <div className="pt-1">
                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-slate-800" />
                  <span className="bg-slate-950 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authMode === "signin" ? "Sign in with Google" : "Sign up with Google"}</span>
                </button>
              </div>
            </div>
          </main>

          <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-500">
            Protected by CineVerse Shield &copy; {new Date().getFullYear()}
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: 6-DIGIT OTP VERIFICATION VIEW                                   */}
      {/* ========================================================================= */}
      {screen === "otp" && (
        <div className="relative min-h-screen w-full flex flex-col justify-between bg-black overflow-hidden">
          {/* Ambient Cinema Posters Backdrop */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 p-3 scale-110 transform -translate-y-8 blur-[1px]">
              {[...posters, ...posters].slice(0, 32).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-900 border border-white/5"
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/90" />
          </div>

          {/* Top Bar with Back Arrow */}
          <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScreen("signin");
                }}
                className="p-2 -ml-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Change identifier"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-rose-600/30 border border-white/15">
                <img src="/logo.png" alt="CineVerse" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                Cine<span className="text-[#e50914]">Verse</span>
              </span>
            </div>
          </header>

          {/* Centered Glassmorphic OTP Card */}
          <main className="relative z-10 flex-1 w-full max-w-[460px] mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
            <div className="relative w-full p-7 sm:p-9 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.85)] space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

              {/* Glowing Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 p-0.5 shadow-xl shadow-red-600/25 mx-auto flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {/* Title & Target Details Badge */}
              <div className="space-y-2 text-center">
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
                  {authMode === "signin"
                    ? `Welcome back${existingUser?.first_name ? `, ${existingUser.first_name}` : ""}!`
                    : "Verify your Account"}
                </h2>
                <div className="flex items-center justify-center pt-0.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    {identifier.includes("@") ? <Mail className="w-3.5 h-3.5 text-rose-400" /> : <Phone className="w-3.5 h-3.5 text-rose-400" />}
                    <span className="font-semibold text-white">
                      {identifier.includes("@")
                        ? identifier.toLowerCase()
                        : `+91 ${identifier.replace(/\D/g, "").slice(-10)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScreen("signin")}
                      className="text-rose-400 hover:text-rose-300 font-bold ml-1 hover:underline cursor-pointer text-[11px]"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Registration User Summary Badge */}
              {authMode === "register" && firstName && surname && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] block">Registering Account For</span>
                    <strong className="text-white text-sm font-bold flex items-center gap-2">
                      <span>{firstName} {surname}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {gender}
                      </span>
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScreen("signin")}
                    className="text-[#e50914] hover:underline text-xs font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* 6-Digit OTP Interactive Boxes */}
                <div className="space-y-2.5">
                  <label className="block text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Enter 6-Digit Passcode
                  </label>
                  <div className="relative flex items-center justify-center gap-2 sm:gap-2.5 my-1">
                    {/* Synchronized hidden input */}
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ""));
                        if (error) setError(null);
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      autoFocus
                    />
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const digit = otpCode[index] || "";
                      const isCurrent = otpCode.length === index;
                      const isFilled = digit !== "";
                      return (
                        <div
                          key={index}
                          className={`w-11 sm:w-12 h-13 sm:h-14 rounded-2xl border flex items-center justify-center text-xl sm:text-2xl font-black font-mono transition-all duration-200 ${
                            isFilled
                              ? "bg-slate-900 border-rose-500/80 text-white shadow-md shadow-rose-950/30 scale-[1.02]"
                              : isCurrent
                              ? "bg-slate-900/90 border-white text-white ring-2 ring-rose-500/30"
                              : "bg-slate-950/70 border-slate-800 text-slate-600"
                          }`}
                        >
                          {digit ? (
                            <span className="animate-in zoom-in-75 duration-150">{digit}</span>
                          ) : isCurrent ? (
                            <span className="w-1 h-5 bg-rose-500 rounded-full animate-pulse" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700/60" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Dev / Demo OTP Helper */}
                  {receivedDevOtp && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-rose-950/30 to-red-950/40 border border-red-500/30 flex items-center justify-between text-xs animate-in fade-in shadow-inner mt-2">
                      <div className="flex items-center gap-2 text-rose-200">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                        <span>Demo OTP: <strong className="font-mono text-white text-sm tracking-widest ml-1 font-bold">{receivedDevOtp}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(receivedDevOtp)}
                        className="px-3 py-1 rounded-lg bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-red-950/50"
                      >
                        Auto Fill
                      </button>
                    </div>
                  )}

                  {/* Resend Code */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-400 pt-1">
                    <span>Didn&apos;t receive code?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-[#e50914] hover:underline font-bold cursor-pointer disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                {/* Big Red Button */}
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e50914] to-[#b80710] hover:from-[#f40612] hover:to-[#c70812] disabled:opacity-50 text-white font-bold text-base tracking-wide transition-all duration-200 active:scale-[0.98] shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>
                      {authMode === "signin" ? "Sign In & Start Watching" : "Complete Registration & Start Watching"}
                    </span>
                  )}
                </button>
              </form>
            </div>
          </main>

          <footer className="relative z-10 w-full py-4 text-center text-[10px] text-slate-600">
            Protected with end-to-end encryption.
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRIVACY MODAL DIALOG                                                      */}
      {/* ========================================================================= */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-left shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#e50914]" />
                <span>Privacy &amp; Data Policy</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <strong>CineVerse</strong> values your privacy. We strictly protect your phone number, profile, and watchlist data.
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                <li>Your phone number is only used for account security and authentication via OTP.</li>
                <li>We do not sell or share personal streaming data with third parties.</li>
                <li>All sessions use encrypted JWT authentication tokens.</li>
                <li>You can update or delete your profile anytime from the Settings menu.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};