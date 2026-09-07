"use client";

import React from "react";
import { Search, X, Filter, RotateCcw, Calendar, Film, ArrowUpDown } from "lucide-react";

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
    <div className="w-full bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Top Search & Action Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
        {/* Real-time Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-rose-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search movies by title (e.g. Inception, Dark Knight, Interstellar)..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
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
              className="w-full appearance-none px-3.5 py-3 pr-8 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
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
              className="w-full appearance-none px-3.5 py-3 pr-8 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
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
          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-3 pr-8 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
            >
              <option value="year_desc">Newest First (2024 → 1970)</option>
              <option value="year_asc">Oldest First (1970 → 2024)</option>
              <option value="rating_desc">Top Rated (★ High to Low)</option>
              <option value="title_asc">Title (A → Z)</option>
              <option value="title_desc">Title (Z → A)</option>
              <option value="views_desc">Most Popular (High Views)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Genre Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onGenreChange("All")}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-all flex-shrink-0 cursor-pointer ${
            selectedGenre === "All"
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
              : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
          }`}
        >
          All ({totalResults})
        </button>
        {availableGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex-shrink-0 cursor-pointer ${
              selectedGenre === genre
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 font-semibold"
                : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};
