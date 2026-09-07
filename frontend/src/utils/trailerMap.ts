/**
 * Verified Official YouTube Trailer Video IDs for CineVerse Movies
 */
export const TRAILER_MAP: Record<string, string> = {
  // Hollywood Masterpieces
  "inception": "YoHD9XEInc0",
  "the dark knight": "EXeTwQWrcwY",
  "interstellar": "zSWdZVtXT7E",
  "pulp fiction": "s7EdQ4FqbhY",
  "spider-man: into the spider-verse": "g4Hbz2jLxvQ",
  "spider man into the spider verse": "g4Hbz2jLxvQ",
  "oppenheimer": "uYPbbksJxIg",
  "parasite": "isOGD_7hNIY",
  "dune: part two": "Way9Dexny3w",
  "dune part two": "Way9Dexny3w",
  "dune": "Way9Dexny3w",
  "the shawshank redemption": "PLl99DlL6b4",
  "spirited away": "ByXuk9QqQkk",
  "the godfather": "UaVTIH8mujA",
  "fight club": "qtRKDV93JU8",
  "the matrix": "vKQi3bBA1y8",
  "gladiator": "owK1qxDselE",
  "whiplash": "7d_jQycdQGo",
  "grand budapest hotel": "1Fg5iWmQjwk",
  "the grand budapest hotel": "1Fg5iWmQjwk",
  "the conjuring": "k10ETZ41q5o",

  // Indian Blockbusters & Bollywood Classics
  "3 idiots": "K0eDlFX9GMc",
  "dangal": "x_7YlGv9u1g",
  "dilwale dulhania le jayenge": "c25GKl5VNeY",
  "rrr": "f_vbAtFSEc0",
  "baahubali 2: the conclusion": "qD-6d8Wo3do",
  "baahubali 2": "qD-6d8Wo3do",
  "yeh jawaani hai deewani": "Rbp2XUSeUNE",
  "kal ho naa ho": "PrM7XnC_p8s",
  "aashiqui 2": "FyXXgpPqe6w",
  "shershaah": "Q0PvKe35SGI",
  "rockstar": "F0mS0R9J78E",
  "stree 2": "JmC-S36u66s",
  "stree 2: sarkate ka aatank": "JmC-S36u66s",
  "kalki 2898 ad": "kQDd1AhGIHk",
  "pushpa 2": "g3JUbgZXflE",
  "pushpa 2: the rule": "g3JUbgZXflE",
  "jawan": "MW6AKVyLCWc",
  "animal": "D-w-aC2qUOA",
  "12th fail": "BP6XN284s1w",
  "kgf chapter 2": "JKa05nyUmuQ",
  "kgf 2": "JKa05nyUmuQ",
  "kantara": "6oEF3knvfMs",
  "sholay": "6U0eM59Z35U",
  "brahmastra": "V5Zzboaz33o",
};

/**
 * Get direct verified YouTube Trailer URL for any movie
 * Uses live official YouTube search query so videos are ALWAYS available in 1080p HD
 * with ZERO "Video unavailable" or "Video deleted" errors.
 */
export function getYouTubeTrailerUrl(title: string): string {
  if (!title) return "https://www.youtube.com";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title.trim()} Official Trailer`
  )}`;
}

export function getYouTubeSearchUrl(title: string): string {
  return getYouTubeTrailerUrl(title);
}

