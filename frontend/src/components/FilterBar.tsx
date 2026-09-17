"use client";

import React from "react";
import { Search, X, RotateCcw, Calendar, Film, ArrowUpDown, Sparkles } from "lucide-react";
import { useMovieStore } from "../context/MovieContext";

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  selectedGenre?: string;
  onGenreChange?: (genre: string) => void;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  availableGenres?: string[];
  availableYears?: number[];
  onClearFilters?: () => void;
  totalResults?: number;
}

export const FilterBar: React.FC<FilterBarProps> = (props) => {
  const store = useMovieStore();

  const search = props.search !== undefined ? props.search : store.search;
  const onSearchChange = props.onSearchChange || store.setSearch;

  const selectedGenre = props.selectedGenre !== undefined ? props.selectedGenre : store.selectedGenre;
  const onGenreChange = props.onGenreChange || store.setSelectedGenre;

  const selectedYear = props.selectedYear !== undefined ? props.selectedYear : store.selectedYear;
  const onYearChange = props.onYearChange || store.setSelectedYear;

  const selectedSort = props.selectedSort !== undefined ? props.selectedSort : store.selectedSort;
  const onSortChange = props.onSortChange || store.setSelectedSort;

  const availableGenres = props.availableGenres || store.availableGenres;
  const availableYears = props.availableYears || store.availableYears;
  const onClearFilters = props.onClearFilters || store.resetFilters;
  const totalResults = props.totalResults !== undefined ? props.totalResults : store.filteredMovies.length;

  const isFiltered = search !== "" || selectedGenre !== "All" || selectedYear !== "";

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Search & Action Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Real-time Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-rose-500" />
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
            placeholder="Search movies by title (e.g. Inception, Dark Knight, Shershaah)..."
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Row: Genre, Release Year, Sort */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Genre Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 sm:py-3 pr-8 rounded-xl bg-slate-950/80 border border-slate-800/90 text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm hover:border-slate-700"
            >
              <option value="All">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Release Year Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 sm:py-3 pr-8 rounded-xl bg-slate-950/80 border border-slate-800/90 text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm hover:border-slate-700"
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[160px]">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 sm:py-3 pr-8 rounded-xl bg-slate-950/80 border border-slate-800/90 text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm hover:border-slate-700"
            >
              <option value="year_desc">Latest Releases ({new Date().getFullYear()} → 1950)</option>
              <option value="views_desc">🔥 Most Popular / Views</option>
              <option value="rating_desc">★ Top Rated</option>
              <option value="year_asc">Oldest Classics (1950 → {new Date().getFullYear()})</option>
              <option value="title_asc">Title (A → Z)</option>
              <option value="title_desc">Title (Z → A)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3.5 py-2.5 sm:py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs sm:text-sm font-bold transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Genre Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => onGenreChange("All")}
          className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${
            selectedGenre === "All"
              ? "bg-[#e50914] text-white shadow-md shadow-rose-600/30 font-bold"
              : "bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
          }`}
        >
          All Movies ({totalResults})
        </button>
        {availableGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${
              selectedGenre === genre
                ? "bg-[#e50914] text-white shadow-md shadow-rose-600/30 font-bold"
                : "bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};
