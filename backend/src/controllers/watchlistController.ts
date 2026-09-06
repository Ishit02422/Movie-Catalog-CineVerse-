import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Movie } from "../models/Movie.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * @desc    Get current user's watchlist movies
 * @route   GET /api/watchlist
 * @access  Private
 */
export const getWatchlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Not authorized to access watchlist.", 401);
    }

    const user = await User.findById(req.user._id).populate({
      path: "watchlist",
      match: { status: { $ne: "removed" } },
    });

    if (!user) {
      throw new ApiError("User not found.", 404);
    }

    const watchlistMovies = (user.watchlist || []).filter(Boolean);

    res.status(200).json({
      success: true,
      count: watchlistMovies.length,
      data: watchlistMovies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle movie in/out of current user's watchlist
 * @route   POST /api/watchlist/toggle/:movieId
 * @access  Private
 */
export const toggleWatchlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Not authorized.", 401);
    }

    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw new ApiError(`Invalid movie ID: ${movieId}`, 400);
    }

    const movie = await Movie.findById(movieId);
    if (!movie || movie.status === "removed") {
      throw new ApiError("Movie not found or unavailable.", 404);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError("User not found.", 404);
    }

    const movieObjId = new mongoose.Types.ObjectId(movieId);
    const existingIndex = (user.watchlist || []).findIndex(
      (id) => id.toString() === movieId
    );

    let isSaved = false;

    if (existingIndex > -1) {
      // Remove from watchlist
      user.watchlist = (user.watchlist || []).filter(
        (id) => id.toString() !== movieId
      );
      isSaved = false;
    } else {
      // Add to watchlist
      if (!user.watchlist) user.watchlist = [];
      user.watchlist.push(movieObjId);
      isSaved = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isSaved,
      message: isSaved
        ? `Added "${movie.title}" to your Watchlist.`
        : `Removed "${movie.title}" from your Watchlist.`,
      watchlistCount: user.watchlist.length,
    });
  } catch (error) {
    next(error);
  }
};
