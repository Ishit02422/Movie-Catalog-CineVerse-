import { Router } from "express";
import {
  getWatchlist,
  toggleWatchlist,
} from "../controllers/watchlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All watchlist routes are protected
router.use(protect);

router.get("/", getWatchlist);
router.post("/toggle/:movieId", toggleWatchlist);

export default router;
