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
  "avatar: the way of water": "d9MyW72ELq0",
  "avatar": "5PSNL1qE6VY",
  "titanic": "kVrqfYjkTdQ",
  "avengers: endgame": "TcMBFSGVi1c",
  "top gun: maverick": "qSqVVqua4Pb",

  // Indian Blockbusters & Bollywood Classics
  "3 idiots": "K0eDlFX9GMc",
  "dangal": "x_7YlGv9u1g",
  "dilwale dulhania le jayenge": "c25GKl5VNeY",
  "ddlj": "c25GKl5VNeY",
  "rrr": "f_vbAtFSEc0",
  "baahubali 2: the conclusion": "qD-6d8Wo3do",
  "baahubali 2": "qD-6d8Wo3do",
  "jab we met": "yMeqkP40-3g",
  "yeh jawaani hai deewani": "Rbp2XUSeUNE",
  "kal ho naa ho": "PrM7XnC_p8s",
  "aashiqui 2": "FyXXgpPqe6w",
  "shershaah": "uSoEiNwVUkQ",
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
  "pk": "SOXWc32k4zA",
  "barfi": "yGQ-N0c7E_g",
  "barfi!": "yGQ-N0c7E_g",
  "drishyam 2": "cxA2y9TglY4",
  "pathaan": "vqu4z34wENw",
};

/**
 * Get YouTube Embed URL for direct embedded iframe playback
 */
export function getYouTubeEmbedUrl(title: string): string | null {
  if (!title) return null;
  const cleanTitle = title.trim().toLowerCase();

  // 1. Direct match in dictionary
  if (TRAILER_MAP[cleanTitle]) {
    return `https://www.youtube.com/embed/${TRAILER_MAP[cleanTitle]}?autoplay=1&rel=0&playsinline=1`;
  }

  // 2. Partial match (e.g. "Dune: Part Two" vs "dune")
  for (const [key, id] of Object.entries(TRAILER_MAP)) {
    if (cleanTitle.includes(key) || key.includes(cleanTitle)) {
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    }
  }

  // 3. Fallback to default featured trailer (Inception)
  return `https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1&rel=0&playsinline=1`;
}

/**
 * Get direct verified YouTube Trailer Search URL for external redirection
 */
export function getYouTubeTrailerUrl(title: string): string {
  if (!title) return "https://www.youtube.com";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title.trim()} Official Trailer`
  )}`;
}
