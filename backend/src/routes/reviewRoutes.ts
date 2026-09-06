import { Router } from "express";
import {
  getMovieReviews,
  addOrUpdateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router({ mergeParams: true });

// Public: Get reviews for a movie
router.get("/:movieId/reviews", getMovieReviews);

// Protected: Add/update review for a movie
router.post("/:movieId/reviews", protect, addOrUpdateReview);

// Protected: Delete review
router.delete("/reviews/:id", protect, deleteReview);

export default router;
