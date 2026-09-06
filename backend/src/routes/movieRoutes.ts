import { Router } from "express";
import {
  getMovies,
  getMovieById,
  getGenres,
  getFeaturedMovies,
  getSimilarMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleFeaturedMovie,
  updateMovieStatus,
} from "../controllers/movieController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes definitions
router.get("/", getMovies);
router.get("/genres", getGenres);
router.get("/featured", getFeaturedMovies);
router.get("/:id", getMovieById);
router.get("/:id/similar", getSimilarMovies);

// Admin-Protected Routes
router.post("/", protect, requireAdmin, createMovie);
router.put("/:id", protect, requireAdmin, updateMovie);
router.delete("/:id", protect, requireAdmin, deleteMovie);
router.patch("/:id/feature", protect, requireAdmin, toggleFeaturedMovie);
router.patch("/:id/status", protect, requireAdmin, updateMovieStatus);

export default router;

