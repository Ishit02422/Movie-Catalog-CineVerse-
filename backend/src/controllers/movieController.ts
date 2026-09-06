import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Movie } from "../models/Movie.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * @desc    Get all movies with search & multi-filter support
 * @route   GET /api/movies
 * @access  Public
 */
export const getMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, genre, release_year, featured, status, sort } = req.query;

    const queryConditions: any[] = [];

    // Filter by status (default to 'active' for public catalog, or specific status, or 'all' for admin)
    if (status && String(status).toLowerCase() === "all") {
      // Return all non-removed or all movies for admin
    } else if (status) {
      queryConditions.push({ status: String(status).toLowerCase() });
    } else {
      queryConditions.push({ status: "active" });
    }

    // 1. Search filter (case-insensitive title search)
    if (search && typeof search === "string" && search.trim() !== "") {
      const sanitizedSearch = search.trim();
      queryConditions.push({
        title: { $regex: sanitizedSearch, $options: "i" },
      });
    }

    // 2. Genre filter (case-insensitive exact genre match)
    if (genre && typeof genre === "string" && genre.trim() !== "") {
      const sanitizedGenre = genre.trim();
      if (sanitizedGenre.toLowerCase() !== "all") {
        queryConditions.push({
          genre: { $regex: `^${sanitizedGenre}$`, $options: "i" },
        });
      }
    }

    // 3. Release year filter
    if (release_year !== undefined && release_year !== "") {
      const parsedYear = Number(release_year);
      if (isNaN(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
        throw new ApiError(
          "Invalid 'release_year' query parameter. Must be a valid 4-digit year.",
          400
        );
      }
      queryConditions.push({ release_year: parsedYear });
    }

    // 4. Featured filter
    if (featured !== undefined) {
      const isFeatured = String(featured).toLowerCase() === "true";
      queryConditions.push({ is_featured: isFeatured });
    }

    // Construct final MongoDB query
    const finalQuery =
      queryConditions.length > 0 ? { $and: queryConditions } : {};

    // Determine sorting order
    let sortOption: any = { release_year: -1, created_at: -1 };
    if (sort) {
      switch (sort) {
        case "year_asc":
          sortOption = { release_year: 1 };
          break;
        case "year_desc":
          sortOption = { release_year: -1 };
          break;
        case "title_asc":
          sortOption = { title: 1 };
          break;
        case "title_desc":
          sortOption = { title: -1 };
          break;
        case "rating_desc":
          sortOption = { rating: -1 };
          break;
        case "views_desc":
          sortOption = { views_count: -1 };
          break;
        default:
          sortOption = { release_year: -1, created_at: -1 };
      }
    }

    const movies = await Movie.find(finalQuery).sort(sortOption);

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single movie details by ID (and increment view count)
 * @route   GET /api/movies/:id
 * @access  Public
 */
export const getMovieById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid movie ID format: '${id}'`, 400);
    }

    // Find movie and increment view count atomically
    const movie = await Movie.findOneAndUpdate(
      { _id: id, status: { $ne: "removed" } },
      { $inc: { views_count: 1 } },
      { new: true }
    );

    if (!movie) {
      throw new ApiError(`Movie not found with id: ${id}`, 404);
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all distinct genres available in the database
 * @route   GET /api/movies/genres
 * @access  Public
 */
export const getGenres = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const genres = await Movie.distinct("genre", {
      status: { $ne: "removed" },
    });

    const sortedGenres = genres.filter(Boolean).sort();

    res.status(200).json({
      success: true,
      count: sortedGenres.length,
      data: sortedGenres,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured movies for hero showcase
 * @route   GET /api/movies/featured
 * @access  Public
 */
export const getFeaturedMovies = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featuredMovies = await Movie.find({
      is_featured: true,
      status: "active",
    })
      .sort({ rating: -1, release_year: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: featuredMovies.length,
      data: featuredMovies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get similar movies based on current movie's genre/category
 * @route   GET /api/movies/:id/similar
 * @access  Public
 */
export const getSimilarMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid movie ID: ${id}`, 400);
    }

    const currentMovie = await Movie.findById(id);
    if (!currentMovie) {
      throw new ApiError("Movie not found.", 404);
    }

    // Split genre if comma-separated or use regex match
    const genreKeywords = currentMovie.genre
      .split(/[,/|]/)
      .map((g) => g.trim())
      .filter(Boolean);

    const genreRegexes = genreKeywords.map((g) => new RegExp(g, "i"));

    const similarMovies = await Movie.find({
      _id: { $ne: currentMovie._id },
      status: "active",
      $or: [
        { genre: { $in: genreRegexes } },
        { genre: new RegExp(currentMovie.genre, "i") },
      ],
    })
      .sort({ rating: -1, release_year: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      count: similarMovies.length,
      data: similarMovies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new movie (Admin Only)
 * @route   POST /api/movies
 * @access  Private/Admin
 */
export const createMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      genre,
      release_year,
      description,
      image_url,
      rating,
      is_featured,
      status,
    } = req.body;

    if (!title || !genre || !release_year || !description || !image_url) {
      throw new ApiError(
        "Please provide all required fields: title, genre, release_year, description, and image_url.",
        400
      );
    }

    const yearNum = Number(release_year);
    if (isNaN(yearNum) || yearNum < 1888 || yearNum > new Date().getFullYear() + 5) {
      throw new ApiError(
        `Invalid release year. Must be between 1888 and ${new Date().getFullYear() + 5}.`,
        400
      );
    }

    const ratingNum = rating !== undefined ? Number(rating) : 8.0;
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      throw new ApiError("Rating must be a number between 0 and 10.", 400);
    }

    const movie = await Movie.create({
      title: title.trim(),
      genre: genre.trim(),
      release_year: yearNum,
      description: description.trim(),
      image_url: image_url.trim(),
      rating: ratingNum,
      is_featured: Boolean(is_featured),
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      message: "Movie created successfully!",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing movie (Admin Only)
 * @route   PUT /api/movies/:id
 * @access  Private/Admin
 */
export const updateMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid movie ID format: '${id}'`, 400);
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      throw new ApiError("Movie not found.", 404);
    }

    const {
      title,
      genre,
      release_year,
      description,
      image_url,
      rating,
      is_featured,
      status,
    } = req.body;

    if (title !== undefined) movie.title = title.trim();
    if (genre !== undefined) movie.genre = genre.trim();
    if (release_year !== undefined) {
      const yearNum = Number(release_year);
      if (isNaN(yearNum) || yearNum < 1888 || yearNum > new Date().getFullYear() + 5) {
        throw new ApiError("Invalid release year.", 400);
      }
      movie.release_year = yearNum;
    }
    if (description !== undefined) movie.description = description.trim();
    if (image_url !== undefined) movie.image_url = image_url.trim();
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
        throw new ApiError("Rating must be between 0 and 10.", 400);
      }
      movie.rating = ratingNum;
    }
    if (is_featured !== undefined) movie.is_featured = Boolean(is_featured);
    if (status !== undefined) movie.status = status;

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie updated successfully!",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a movie (Admin Only)
 * @route   DELETE /api/movies/:id
 * @access  Private/Admin
 */
export const deleteMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid movie ID format: '${id}'`, 400);
    }

    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      throw new ApiError("Movie not found.", 404);
    }

    res.status(200).json({
      success: true,
      message: `Movie '${movie.title}' deleted successfully!`,
      data: { id: movie.id || movie._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle featured status of a movie (Admin Only)
 * @route   PATCH /api/movies/:id/feature
 * @access  Private/Admin
 */
export const toggleFeaturedMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid movie ID format: '${id}'`, 400);
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      throw new ApiError("Movie not found.", 404);
    }

    movie.is_featured = !movie.is_featured;
    await movie.save();

    res.status(200).json({
      success: true,
      message: movie.is_featured
        ? `Movie '${movie.title}' is now Featured on Hero Banner!`
        : `Movie '${movie.title}' removed from Featured.`,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update movie visibility status (Active, Hidden, Under Review, Removed) (Admin Only)
 * @route   PATCH /api/movies/:id/status
 * @access  Private/Admin
 */
export const updateMovieStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid movie ID format: '${id}'`, 400);
    }

    const validStatuses = ["active", "hidden", "under_review", "removed"];
    if (!status || !validStatuses.includes(String(status).toLowerCase())) {
      throw new ApiError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400
      );
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      throw new ApiError("Movie not found.", 404);
    }

    movie.status = String(status).toLowerCase() as any;
    await movie.save();

    res.status(200).json({
      success: true,
      message: `Movie '${movie.title}' status updated to '${movie.status}'!`,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

