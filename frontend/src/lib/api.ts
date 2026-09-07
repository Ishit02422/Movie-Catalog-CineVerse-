import { Movie, MovieFilterParams, ApiResponse } from "../types/movie";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://movie-catalog-cineverse.onrender.com/api"
    : "http://localhost:5000/api");

/**
 * Fetch movies list with optional query filters (search, genre, year, sort)
 */
export async function fetchMovies(
  params?: MovieFilterParams
): Promise<Movie[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.search && params.search.trim()) {
      searchParams.append("search", params.search.trim());
    }
    if (params?.genre && params.genre !== "All") {
      searchParams.append("genre", params.genre);
    }
    if (params?.release_year && params.release_year !== "") {
      searchParams.append("release_year", String(params.release_year));
    }
    if (params?.sort) {
      searchParams.append("sort", params.sort);
    }

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/movies${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      cache: "no-store", // Always fetch fresh data
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch movies: ${res.statusText}`);
    }

    const result: ApiResponse<Movie[]> = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("API Error in fetchMovies:", error);
    throw error;
  }
}

/**
 * Fetch top featured movies for hero section
 */
export async function fetchFeaturedMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/movies/featured`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch featured movies: ${res.statusText}`);
    }

    const result: ApiResponse<Movie[]> = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("API Error in fetchFeaturedMovies:", error);
    return [];
  }
}

/**
 * Fetch distinct genres list
 */
export async function fetchGenres(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/movies/genres`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch genres: ${res.statusText}`);
    }

    const result: ApiResponse<string[]> = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("API Error in fetchGenres:", error);
    return [];
  }
}

/**
 * Fetch single movie details by ID
 */
export async function fetchMovieById(id: string): Promise<Movie | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404 || res.status === 400) {
        return null;
      }
      throw new Error(`Failed to fetch movie details: ${res.statusText}`);
    }

    const result: ApiResponse<Movie> = await res.json();
    return result.data || null;
  } catch (error) {
    console.error(`API Error in fetchMovieById(${id}):`, error);
    throw error;
  }
}
