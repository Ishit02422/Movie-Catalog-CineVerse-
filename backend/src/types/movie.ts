export interface IMovie {
  id?: string;
  _id?: string;
  title: string;
  genre: string;
  release_year: number;
  description: string;
  image_url: string;
  status?: "active" | "hidden" | "under_review" | "removed";
  is_featured?: boolean;
  rating?: number;
  views_count?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MovieQueryParams {
  search?: string;
  genre?: string;
  release_year?: string | number;
  status?: string;
  featured?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
}
