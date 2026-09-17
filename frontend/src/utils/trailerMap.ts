/**
 * Utility to generate accurate, direct YouTube Official Trailer Search URLs
 * for every movie in CineVerse without iframe embedding restrictions.
 */
export function getYouTubeTrailerUrl(title: string, customTrailerUrl?: string): string {
  if (customTrailerUrl && customTrailerUrl.trim().startsWith("http")) {
    return customTrailerUrl.trim();
  }
  if (!title) return "https://www.youtube.com";

  // Clean title
  const cleanTitle = title.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${cleanTitle} Official Trailer`
  )}`;
}