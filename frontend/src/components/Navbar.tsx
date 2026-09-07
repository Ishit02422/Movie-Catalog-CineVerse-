"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, LogOut, User as UserIcon, Settings, Bookmark, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import { ProfileModal } from "./ProfileModal";

interface NavbarProps {
  totalMovies?: number;
  onOpenProfile?: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalMovies,
  onOpenProfile,
  activeTab = "all",
  onSelectTab,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const [internalProfileOpen, setInternalProfileOpen] = useState(false);

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      setInternalProfileOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              onClick={() => onSelectTab && onSelectTab("all")}
              className="flex items-center gap-2.5 group transition-transform duration-200 active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-rose-600/40 border border-white/15 group-hover:scale-105 group-hover:border-[#e50914] transition-all duration-300">
                <img
                  src="/logo.png"
                  alt="CineVerse"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans drop-shadow-md">
                Cine<span className="text-[#e50914]">Verse</span>
              </span>
            </Link>

            {/* Nav Tabs: Movies / My List / Admin */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-semibold">
              <Link
                href="/"
                onClick={() => onSelectTab && onSelectTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "all"
                    ? "bg-slate-850 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Movies
              </Link>
              <Link
                href="/#watchlist"
                onClick={() => onSelectTab && onSelectTab("watchlist")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "watchlist"
                    ? "bg-slate-850 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My List</span>
                {watchlist.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#e50914] text-white">
                    {watchlist.length}
                  </span>
                )}
              </Link>

              {/* Admin Panel Link */}
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  user?.role === "admin"
                    ? "text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin</span>
              </Link>
            </nav>
          </div>

          {/* User Profile & Logout Button if Authenticated */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
                {/* Clickable Profile Pill */}
                <button
                  type="button"
                  onClick={handleProfileClick}
                  title="View & Edit Profile"
                  className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 px-2.5 py-1 rounded-full transition-all group cursor-pointer active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-rose-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white hidden md:inline max-w-[130px] truncate">
                    {user.name || (user.phone ? `+91 ${user.phone.slice(-5)}` : "Profile")}
                  </span>
                  <Settings className="w-3 h-3 text-slate-400 group-hover:text-rose-400 transition-colors hidden sm:inline" />
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Internal Modal when Navbar triggers it directly */}
      {!onOpenProfile && (
        <ProfileModal
          isOpen={internalProfileOpen}
          onClose={() => setInternalProfileOpen(false)}
        />
      )}
    </>
  );
};

