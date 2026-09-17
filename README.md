# 🎬 CineVerse - Full-Stack Movie Catalog & Streaming Platform

A high-performance, ultra-responsive cinema-themed movie catalog and discovery platform built with **Next.js 16 (App Router, Turbopack)**, **TypeScript 5**, **Tailwind CSS**, **Node.js + Express REST API**, and **MongoDB with Mongoose**.

---

## 🌟 Key Features & Updates

### 1. 🖥️ Ultra-Responsive Widescreen Layout
- **Full-Width Expansion**: Fluid responsive container (`w-full px-4 sm:px-8 lg:px-12`) across Dashboard and Movie Details pages.
- **Dynamic 2 to 7 Grid Columns**: Adapts smoothly from mobile (2 columns) up to ultrawide 2K/4K monitors (7 columns).

### 2. 🔐 Multi-Channel Passwordless Authentication & Session Persistence
- **Email & Phone OTP**: Passwordless sign-in and registration with 6-digit verification codes sent via Nodemailer (Gmail SMTP) or SMS.
- **BcryptJS Cryptographic Hashing**: OTP codes are salted and hashed before storing in MongoDB; zero plaintext OTP storage.
- **1-Click Google OAuth**: Seamless Google Sign-In with Firebase popup.
- **Persistent Sessions**: User and Admin sessions persist in `localStorage` across browser restarts until explicit logout.

### 3. 🎥 YouTube Official Trailer Engine
- Direct official trailer launcher (`getYouTubeTrailerUrl`) opening verified official trailers directly on YouTube in new tabs without iframe embedding restrictions.

### 4. 👁️ Live View Counter & Unique View Tracking
- **Exact Formatted View Counter**: Real-time view metrics (e.g. `5,410,000 views`) on Movie Cards and Details pages.
- **Unique View Tracking**: Atomically registers **1 unique view (+1)** per audience member without inflating view counts on back navigation.
- **Real-Time State Sync**: Instant updates across the app via `MovieContext.updateMovieInStore` without manual browser refresh (F5).

### 5. ⭐ Community 5-Star Reviews & Rating Studio
- Interactive 5-star rating studio with comment submissions, review listing, and author/admin deletion controls.

### 6. 🗂️ Universal Search, Filter & Sort
- 350ms debounced real-time title search.
- Multi-genre filtering pills & dropdowns.
- Historical release year range (1950 to current year).
- Dynamic sorting by Popularity / Views, IMDb Rating, Release Year, and Alphabetical title.

### 7. ⚙️ Admin Studio Portal (`/admin`)
- Master-detail content management system for movie CRUD operations, image compression, distribution status workflows (`Active`, `Hidden`, `Under Review`, `Removed`), and 1-click live IMDb popularity synchronization.

---

## 📁 Project Architecture

```
Movie Catalog Application/
├── backend/                             # Express.js REST API + MongoDB Mongoose
│   ├── src/
│   │   ├── config/db.ts                 # Database Connection
│   │   ├── controllers/                 # authController, movieController, reviewController
│   │   ├── middleware/                  # authMiddleware, errorHandler
│   │   ├── models/                      # Movie, User, Review, Otp
│   │   ├── routes/                      # authRoutes, movieRoutes, reviewRoutes
│   │   ├── utils/                       # dynamicPopularityService, seed.ts
│   │   └── server.ts                    # Express Entrypoint
│   └── package.json
├── frontend/                            # Next.js 16 (App Router) + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/page.tsx           # Admin Studio Portal
│   │   │   ├── movies/[id]/page.tsx     # Widescreen Movie Details Page
│   │   │   └── page.tsx                 # Main Dashboard
│   │   ├── components/                  # Navbar, HeroBanner, FilterBar, MovieGrid, MovieCard, ProfileModal
│   │   ├── context/                     # AuthContext, MovieContext, WatchlistContext, ToastContext
│   │   ├── lib/api.ts                   # Type-safe API Client
│   │   └── utils/trailerMap.ts          # YouTube Trailer Dictionary & Fallback
│   └── package.json
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### Step 1: Install Dependencies
From the repository root:
```bash
npm run install:all
```

### Step 2: Seed the Database
Populate MongoDB with curated blockbuster movies:
```bash
npm run seed --workspace=backend
```

### Step 3: Start Development Servers
Run frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Admin Studio:** [http://localhost:3000/admin](http://localhost:3000/admin) (Default: `admin@cineverse.com` / `Admin@12345`)

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Query / Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/phone/send-otp` | `{ identifier, mode }` | Sends 6-digit OTP via Email/SMS | Public |
| `POST` | `/api/auth/phone/verify-otp`| `{ identifier, otp }` | Verifies bcrypt OTP & returns JWT token | Public |
| `POST` | `/api/auth/login` | `{ email, password }` | Traditional login | Public |
| `POST` | `/api/auth/google` | `{ name, email }` | Google OAuth authentication | Public |
| `GET` | `/api/movies` | `search`, `genre`, `year`, `sort` | Fetches filtered & sorted movie catalog | Public |
| `GET` | `/api/movies/:id` | `inc_view=true/false` | Fetches movie details & updates view count | Public |
| `GET` | `/api/movies/featured` | None | Fetches Hero Carousel featured movies | Public |
| `GET` | `/api/movies/genres` | None | Returns distinct genres dynamically | Public |
| `GET` | `/api/movies/:id/reviews`| None | Fetches all community reviews for a movie | Public |
| `POST` | `/api/movies/:id/reviews`| `{ rating, comment }` | Submits 5-star review & updates score | Private |
| `POST` | `/api/movies` | Movie data payload | Creates new movie in catalog | Admin Only |
| `PUT` | `/api/movies/:id` | Movie data payload | Updates movie details | Admin Only |
| `DELETE`| `/api/movies/:id` | None | Deletes movie from catalog | Admin Only |
| `POST` | `/api/movies/sync-popularity` | None | Synchronizes catalog with live IMDb ratings | Admin Only |
