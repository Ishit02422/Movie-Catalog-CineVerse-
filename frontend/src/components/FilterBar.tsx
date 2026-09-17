"use client";

import React from "react";
import { Search, X, RotateCcw, Calendar, Film, ArrowUpDown, Sparkles } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  availableGenres: string[];
  availableYears: number[];
  onClearFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  selectedSort,
  onSortChange,
  availableGenres,
  availableYears,
  onClearFilters,
  totalResults,
}) => {
  const isFiltered = search !== "" || selectedGenre !== "All" || selectedYear !== "";

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Top Search & Action Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        {/* Real-time Search Input Box with larger font */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-rose-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
              onSearchChange(sanitized);
            }}
            onKeyDown={(e) => {
              if (
                e.key === " " &&
                (!e.currentTarget.value ||
                  e.currentTarget.selectionStart === 0 ||
                  e.currentTarget.value.endsWith(" "))
              ) {
                e.preventDefault();
              }
            }}
            placeholder="Search movies by title (e.g. Inception, Dark Knight, Dangal)..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-base focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dropdowns Row: Genre, Release Year, Sort */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Genre Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="w-full appearance-none px-4 py-3.5 pr-9 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm hover:border-slate-700"
            >
              <option value="All">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Film className="w-4 h-4" />
            </div>
          </div>

          {/* Release Year Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full appearance-none px-4 py-3.5 pr-9 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm hover:border-slate-700"
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[170px]">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none px-4 py-3.5 pr-9 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm hover:border-slate-700"
            >
              <option value="year_desc">Latest Releases ({new Date().getFullYear()} → 1950)</option>
              <option value="views_desc">🔥  Most Popular / Highest Views</option>
              <option value="rating_desc">★ Top Rated (High to Low)</option>
              <option value="year_asc">Oldest Classics (1950 → {new Date().getFullYear()})</option>
              <option value="title_asc">Title (A → Z)</option>
              <option value="title_desc">Title (Z → A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-sm font-bold transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Genre Quick Pills with larger font and comfortable padding */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => onGenreChange("All")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex-shrink-0 cursor-pointer ${
            selectedGenre === "All"
              ? "bg-[#e50914] text-white shadow-lg shadow-rose-600/40 scale-105"
              : "bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
          }`}
        >
          All Movies ({totalResults})
        </button>
        {availableGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${
              selectedGenre === genre
                ? "bg-[#e50914] text-white shadow-lg shadow-rose-600/40 font-bold scale-105"
                : "bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};
