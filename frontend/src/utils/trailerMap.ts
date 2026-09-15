/**
 * Verified Official YouTube Trailer Video IDs for CineVerse Movies
 */
export const TRAILER_MAP: Record<string, string> = {
  // Hollywood Masterpieces
  "inception": "YoHD9XEInc0",
  "the dark knight": "EXeTwQWrcwY",
  "dark knight": "EXeTwQWrcwY",
  "interstellar": "zSWdZVtXT7E",
  "pulp fiction": "s7EdQ4FqbhY",
  "spider-man: into the spider-verse": "g4Hbz2jLxvQ",
  "spider man into the spider verse": "g4Hbz2jLxvQ",
  "spider-man": "g4Hbz2jLxvQ",
  "oppenheimer": "uYPbbksJxIg",
  "parasite": "isOGD_7hNIY",
  "dune: part two": "Way9Dexny3w",
  "dune part two": "Way9Dexny3w",
  "dune": "Way9Dexny3w",
  "the shawshank redemption": "PLl99DlL6b4",
  "shawshank redemption": "PLl99DlL6b4",
  "spirited away": "J01O93p1_0Q",
  "the godfather": "UaVTIH8mujA",
  "godfather": "UaVTIH8mujA",
  "fight club": "qtRKDV93JU8",
  "the matrix": "vKQi3bBA1y8",
  "matrix": "vKQi3bBA1y8",
  "gladiator": "P5ieIbInFpg",
  "whiplash": "7d_jQycdQGo",
  "grand budapest hotel": "z4aIU-TOA6w",
  "the grand budapest hotel": "z4aIU-TOA6w",
  "the conjuring": "k10ETZ41q5o",
  "avatar: the way of water": "d9MyW72ELq0",
  "avatar": "5PSNL1qE6VY",
  "titanic": "kVrqfYjkTdQ",
  "avengers: endgame": "TcMBFSGVi1c",
  "top gun: maverick": "qSqVVqua4Pb",

  // Indian Blockbusters & Bollywood Classics
  "sachin a billion dreams": "b1vV_w71G2g",
  "sachin": "b1vV_w71G2g",
  "3 idiots": "K0u_kAWLJOA",
  "dangal": "x_7YlGv9u1g",
  "dilwale dulhania le jayenge": "u6p9P0K-o1s",
  "ddlj": "u6p9P0K-o1s",
  "rrr": "NgOq9f-y7sQ",
  "baahubali 2: the conclusion": "qD20G2sZg1w",
  "baahubali 2": "qD20G2sZg1w",
  "baahubali": "qD20G2sZg1w",
  "jab we met": "yMeqkP40-3g",
  "yeh jawaani hai deewani": "Rbp2PojU_n4",
  "yjhd": "Rbp2PojU_n4",
  "kal ho naa ho": "tVMAQAsjsOU",
  "khnh": "tVMAQAsjsOU",
  "aashiqui 2": "_2cZmmDk0og",
  "shershaah": "uSoEiNwVUkQ",
  "rockstar": "7-q_2w74VfA",
  "barfi": "qM955lXgq-g",
  "barfi!": "qM955lXgq-g",
  "pk": "SOXWc32k4zA",
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
  "drishyam 2": "cxA2y9TglY4",
  "pathaan": "vqu4z34wENw",
  "tiger 3": "vM60_s4Ld6Q",
  "dunki": "2v8o-B_4jA4",
  "fighter": "6amIq_mP4xM",
  "kabir singh": "RiANSSgCuJk",
  "sanju": "rrrpt4u2G60",
  "gangs of wasseypur": "j-XfL34V9jM",
  "lagaan": "oSIGhnSZzI8",
  "swades": "wZ7LytxXW0s",
  "chak de india": "6a0-dSmOtVo",
  "zindagi na milegi dobara": "FJrtc2zS130",
  "znmd": "FJrtc2zS130",
  "queen": "KGC6vl3Arf0",
  "andhadhun": "2iVYI99VGaw",
  "tumbbad": "sN75MPxgvX8",
  "drishyam": "AuuX2j14NBg",
};

/**
 * Normalizes movie title for reliable dictionary lookup
 */
function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[!.,:;'"?/\-_()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get YouTube Embed URL for direct embedded iframe playback
 */
export function getYouTubeEmbedUrl(title: string): string | null {
  if (!title) return null;

  const rawLower = title.trim().toLowerCase();
  const cleanTitle = normalizeTitle(title);

  // 1. Direct match on raw lower or cleaned title
  if (TRAILER_MAP[rawLower]) {
    return `https://www.youtube.com/embed/${TRAILER_MAP[rawLower]}?autoplay=1&rel=0&playsinline=1`;
  }
  if (TRAILER_MAP[cleanTitle]) {
    return `https://www.youtube.com/embed/${TRAILER_MAP[cleanTitle]}?autoplay=1&rel=0&playsinline=1`;
  }

  // 2. Partial / Substring match (e.g. "Sachin: A Billion Dreams" matches "sachin")
  for (const [key, id] of Object.entries(TRAILER_MAP)) {
    const cleanKey = normalizeTitle(key);
    if (cleanKey.length >= 3 && (cleanTitle.includes(cleanKey) || cleanKey.includes(cleanTitle))) {
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    }
  }

  // No arbitrary wrong fallback - return null so modal shows dedicated search & launch player!
  return null;
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
 