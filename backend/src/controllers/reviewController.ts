import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Movie } from "../models/Movie.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { ApiError } from "../middleware/errorHandler.js";

// Helper to recalculate and update movie rating
async function updateMovieAverageRating(movieId: string): Promise<void> {
  const reviews = await Review.find({ movie: movieId });
  if (reviews.length > 0) {
    const totalScore = reviews.reduce((acc, r) => acc + r.rating, 0);
    // Convert 1-5 scale into 1-10 movie rating or scale appropriately
    const avgFiveStar = totalScore / reviews.length;
    // Scale 5-star rating to 10-point scale with 1 decimal precision
    const scaledTenPoint = Math.round(avgFiveStar * 2 * 10) / 10;
    await Movie.findByIdAndUpdate(movieId, { rating: scaledTenPoint });
  }
}

/**
 * @desc    Get all reviews for a specific movie
 * @route   GET /api/movies/:movieId/reviews
 * @access  Public
 */
export const getMovieReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new ApiError(`Invalid movie ID: ${movieId}`, 400);
    }

    const reviews = await Review.find({ movie: movieId })
      .sort({ created_at: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or update review for a movie
 * @route   POST /api/movies/:movieId/reviews
 * @access  Private
 */
export const addOrUpdateReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Please sign in to rate and review movies.", 401);
    }

    const { movieId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new ApiError(`Invalid movie ID: ${movieId}`, 400);
    }

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      throw new ApiError("Rating must be a number between 1 and 5 stars.", 400);
    }

    if (!comment || String(comment).trim().length === 0) {
      throw new ApiError("Please provide your review comment.", 400);
    }

    const movie = await Movie.findById(movieId);
    if (!movie || movie.status === "removed") {
      throw new ApiError("Movie not found or unavailable.", 404);
    }

    const userName = req.user.name || req.user.first_name || "CineVerse Reviewer";
    const userAvatar = req.user.avatar || undefined;

    // Check if user already reviewed this movie
    let review = await Review.findOne({
      user: req.user._id,
      movie: movieId,
    });

    if (review) {
      // Update existing review
      review.rating = parsedRating;
      review.comment = String(comment).trim();
      review.user_name = userName;
      review.user_avatar = userAvatar;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user: req.user._id,
        user_name: userName,
        user_avatar: userAvatar,
        movie: movieId,
        rating: parsedRating,
        comment: String(comment).trim(),
      });
    }

    // Recalculate movie average rating
    await updateMovieAverageRating(movieId);

    res.status(200).json({
      success: true,
      message: "Review posted successfully!",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete own review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Not authorized.", 401);
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(`Invalid review ID: ${id}`, 400);
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new ApiError("Review not found.", 404);
    }

    // Ensure only review author or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new ApiError("You are not authorized to delete this review.", 403);
    }

    const movieId = review.movie.toString();
    await Review.findByIdAndDelete(id);

    // Recalculate movie average rating
    await updateMovieAverageRating(movieId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
