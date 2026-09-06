export interface Movie {
  _id?: string;
  id?: string;
  title: string;
  genre: string;
  release_year: number;
  description: string;
  image_url: string;
  status?: "active" | "hidden" | "under_review" | "removed";
  is_featured?: boolean;
  rating?: number;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MovieFilterParams {
  search?: string;
  genre?: string;
  release_year?: number | string;
  sort?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}
