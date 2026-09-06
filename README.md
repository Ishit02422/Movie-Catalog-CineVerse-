# CineVerse - Full-Stack Movie Catalog Application

A responsive, feature-packed full-stack **Movie Catalog Application** built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Node.js + Express REST API**, and **MongoDB with Mongoose**.

---

## 🌟 Key Features

### 1. Database & Indexing (MongoDB + Mongoose)
- Curated collection schema with: `id`, `title`, `genre`, `release_year`, `description`, `image_url`, `rating`, `views_count`, `featured`, and timestamps.
- **Optimized MongoDB Indexes**: High-performance compound & single-field indexes on `title`, `genre`, `release_year`, and `featured`.
- Automated **Database Seed Script** with 16 curated high-quality movies across multiple genres and years.

### 2. Robust Backend REST APIs (`Express + TypeScript`)
- `GET /api/movies` — Fetch all movies with simultaneous case-insensitive `search`, `genre` filter, `release_year` filter, and sorting (`rating_desc`, `year_desc`, `title_asc`).
- `GET /api/movies/:id` — Fetch movie details by ID with validation and 404 handling.
- `GET /api/movies/genres` — Retrieve distinct available movie genres dynamically.
- `GET /api/movies/featured` — Retrieve top rated featured movies for the carousel.
- Centralized error handling, input validation, CORS, and JSON response normalization.

### 3. Modern Cinema-Themed Frontend (`Next.js + Tailwind CSS`)
- **Direct Catalog Dashboard**: Opens directly to `http://localhost:3000` with zero barriers.
- **Hero Carousel Banner**: Dynamic auto-sliding featured movies carousel.
- **Real-Time Search with Debounce**: 350ms custom `useDebounce` hook for smooth, lag-free searching.
- **Multi-Filter Bar**: Genre pill filters, release year dropdown, sort dropdown, and "Clear Filters" button.
- **Responsive Movie Grid**: Responsive layout across Mobile, Tablet, and Desktop with poster image fallbacks, hover zoom effects, and rating badges.
- **Movie Details Page (`/movies/[id]`)**: Detailed view with high-res poster, synopsis, star rating visualization, metadata, copy link action, and "Back to Movies" navigation.
- **Graceful States**: Polished loading skeleton cards, empty result state, and 404 movie not found view.

---

## 📁 Project Structure

```
Movie Catalog Application/
├── backend/                        # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/db.ts            # Mongoose MongoDB connection
│   │   ├── controllers/            # movieController.ts
│   │   ├── middleware/             # errorHandler.ts, authMiddleware.ts
│   │   ├── models/Movie.ts         # Movie Schema & Performance Indexes
│   │   ├── routes/movieRoutes.ts   # Express REST endpoints
│   │   ├── types/movie.ts          # Backend TypeScript interfaces
│   │   ├── utils/seed.ts           # Database Seeder (16 sample movies)
│   │   └── server.ts               # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # Next.js 16 (App Router) + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Main Movie Catalog Dashboard
│   │   │   ├── movies/[id]/page.tsx# Movie Details Page
│   │   │   ├── layout.tsx          # Root Layout & Typography
│   │   │   └── globals.css         # Tailwind & Custom Styles
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Sticky Header with Live Movie Counter
│   │   │   ├── HeroBanner.tsx      # Cinema Featured Carousel Banner
│   │   │   ├── FilterBar.tsx       # Search bar, Genre & Year filters
│   │   │   ├── MovieGrid.tsx       # Dynamic Movie Grid & Empty states
│   │   │   ├── MovieCard.tsx       # Responsive Movie Card with Badges
│   │   │   └── LoadingSkeleton.tsx # Shimmer loading animation
│   │   ├── hooks/useDebounce.ts    # Custom Debounce Hook
│   │   ├── lib/api.ts              # Type-safe API Client
│   │   └── types/movie.ts          # Frontend TypeScript definitions
│   ├── next.config.ts
│   └── package.json
├── package.json                    # Root scripts for running full-stack
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://localhost:27017/movie_catalog`

---

### Step 1: Install Dependencies
From the project root:
```bash
npm run install:all
```

---

### Step 2: Seed the Database
Populate MongoDB with sample movies:
```bash
npm run seed --workspace=backend
# or cd backend && npm run seed
```

---

### Step 3: Run the Application
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:5000/api/movies](http://localhost:5000/api/movies)

---

## 📡 Backend API Endpoints

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/movies` | `search`, `genre`, `release_year`, `sort` | Get all movies with multi-filtering |
| `GET` | `/api/movies/:id` | None | Get single movie details by MongoDB `_id` |
| `GET` | `/api/movies/genres` | None | Get distinct list of genres |
| `GET` | `/api/movies/featured`| None | Get top rated featured movies for carousel |

---

## 🧪 Testing & Verification

Run the automated end-to-end verification script:
```bash
node "C:\Users\Lenovo\.gemini\antigravity-ide\brain\0c8a012a-56c4-4d16-b275-eca18adffb41\scratch\test_e2e.mjs"
```
Tests pass for:
- Database connectivity & movie retrieval
- Case-insensitive search
- Genre & release year filters (individual & combined)
- Featured movies & distinct genres
- Single movie by ID
- Frontend homepage & movie details routing
