# 🎬 CineVerse - Full-Stack Movie Catalog & Streaming Platform
## Comprehensive Technical Documentation & Architecture Guide

---

## 📌 1. Project Overview

**CineVerse** is a modern, enterprise-grade movie catalog, streaming discovery, and management platform built with high performance, security, and responsive UI aesthetics in mind. The platform provides passwordless OTP authentication (via Email & SMS), real-time search and multi-filtering, dynamic real-world IMDb popularity tracking, YouTube trailer streaming, personalized user watchlists, and an administrative control studio.

---

## 🛠️ 2. Technology Stack

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CineVerse Platform                             │
├────────────────────────────────────┬─────────────────────────────────────┤
│ Frontend Architecture              │ Backend Architecture                │
├────────────────────────────────────┼─────────────────────────────────────┤
│ • Next.js 16 (Turbopack, App Router)│ • Node.js & Express.js              │
│ • TypeScript 5                     │ • TypeScript 5                      │
│ • Tailwind CSS (Glassmorphism)     │ • MongoDB & Mongoose ODM            │
│ • Lucide React Icons               │ • JWT & BcryptJS Password Hashing   │
│ • Context API (Auth / Watchlist)   │ • Nodemailer (Gmail HTTPS Relay)    │
│ • Responsive Netflix-Style UI      │ • Live IMDb & OMDb Engine           │
└────────────────────────────────────┴─────────────────────────────────────┘
```

---

## 🚀 3. Core Modules & Functionality Breakdown

### 🔐 Module 1: Passwordless Multi-Channel Authentication (Email & Phone OTP)
- **Multi-Identifier Delivery**: Users can log in or register seamlessly using either their **Email address** (via Nodemailer Gmail SMTP) or their **10-Digit Mobile Number** (via Twilio/Fast2SMS).
- **Cryptographic Bcrypt Hashing**: Generated 6-digit verification codes are hashed using `bcryptjs` with auto-salted rounds before persisting in MongoDB. Plaintext OTPs are never stored in the database.
- **Zero-Leak API Payloads**: API response payloads strictly omit raw OTPs (`dev_otp`), ensuring complete protection against Network tab inspection and man-in-the-middle attacks.
- **Smart User Presence Detection**: Instant pre-check API determines whether the identifier belongs to an existing user or a new registrant, dynamically tailoring the UI flow.
- **1-Click Google OAuth**: Integrated one-click Google authentication with persistent JWT session handling.

---

### 🎬 Module 2: Dynamic Movie Catalog, Multi-Filtering & Instant Search
- **Debounced Real-Time Search**: Instant search-as-you-type mechanism with automatic query sanitization and debouncing to minimize unnecessary network calls.
- **Multi-Level Taxonomy Filters**:
  - **Genre Filtering**: Dynamic pills and dropdowns (Action, Sci-Fi, Drama, Romance, Comedy, Crime, Horror, Animation).
  - **Release Year Filtering**: Dynamic historical range from 1950 down to the current year.
- **Dynamic Sorting Algorithms**:
  - 🔥 **Most Popular / Highest Views** (Ranked by million-scale live viewer counts)
  - ★ **Top Rated** (Ranked by verified IMDb ratings, High to Low)
  - 📅 **Latest Releases** (Newest release years first)
  - 🔤 **Alphabetical Ordering** (A → Z, Z → A)
- **1-Click Active Tag Reset**: Visible filter tags with 1-click removal and global reset buttons.

---

### 🎥 Module 3: YouTube Trailer Engine & Smart Fallback
- **Direct Trailer Player**: Every movie card and details page includes a prominent **"▶ Watch Trailer"** CTA button.
- **Verified Trailer Dictionary ([trailerMap.ts](file:///d:/Movie%20Catalog%20Application/frontend/src/utils/trailerMap.ts))**: Pre-indexed dictionary mapping Hollywood & Bollywood blockbusters to their verified official YouTube IDs.
- **Smart Dynamic Search Fallback**: For movies not pre-indexed in the dictionary, the system automatically redirects to YouTube with an exact search query (`[Movie Title] Official Trailer`), ensuring zero playback of incorrect or mismatched videos.

---

### 📊 Module 4: Real-World Popularity & Dynamic Live Viewer Counter
- **Realistic Million-Scale View Counts**: Pre-seeded and live-synced with authentic global streaming figures (e.g., *Dangal*: 5.8M views, *3 Idiots*: 5.4M views, *RRR*: 5.1M views, *The Dark Knight*: 4.8M views, *The Conjuring*: 4.9M views).
- **Real-Time Atomic Auto-Increment**: Opening any movie details page triggers an atomic `$inc: { views_count: 1 }` database update.
- **React StrictMode Guard**: Client-side `useRef` lifecycle guard ensures exactly **1 view per unique user visit**, eliminating artificial duplicate view counts during development mode.
- **Dynamic Popularity Engine ([dynamicPopularityService.ts](file:///d:/Movie%20Catalog%20Application/backend/src/utils/dynamicPopularityService.ts))**: Live OMDb / IMDb integration to dynamically fetch authentic ratings and popularity metrics for any newly added movie.
- **Dedicated Homepage Live Trending Row**: Dynamic row sorting top-performing blockbusters by live viewer engagement.

---

### 🔖 Module 5: Personalized Watchlist & User Profile Experience
- **My List (Watchlist)**: Instant bookmarking system persisted across sessions and synchronized with MongoDB for authenticated profiles.
- **Recently Viewed History**: Real-time localStorage tracking of the last 12 visited movies per active user.
- **Interactive 5-Star Reviews**: Audience rating and review system with interactive hover feedback, review lists, and deletion controls.
- **Profile Management**: Full account profile updating (First Name, Surname, Gender, Phone, Email) with anti-spam realistic human name validation.

---

### ⚙️ Module 6: Admin Studio (Content Management System)
- **Role-Based Access Control**: Secure administrator portal protected by `requireAdmin` middleware.
- **Full Movie CRUD Operations**: Add, Edit, and Delete movies with automatic metadata enrichment.
- **Status Workflow**: Manage distribution state with `Active`, `Hidden`, `Under Review`, and `Removed` flags.
- **1-Click Hero Banner Feature Toggle**: Instantly promote or demote movies to the homepage Hero Carousel.
- **⚡ 1-Click Live Popularity Sync**: Admin button to synchronize the entire database catalog with live IMDb ratings and real-world view metrics.

---

## 🗄️ 4. Database Architecture & ER Diagram

```mermaid
erDiagram
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ MOVIE : "bookmarks in watchlist"
    MOVIE ||--o{ REVIEW : "receives"

    USER {
        ObjectId _id PK
        string name
        string first_name
        string surname
        string gender "Male | Female | Other"
        string email UK
        string phone UK
        string role "user | admin"
        ObjectId[] watchlist FK
        date created_at
    }

    MOVIE {
        ObjectId _id PK
        string title
        string genre
        number release_year
        number rating
        number views_count
        boolean is_featured
        string status "active | hidden | under_review | removed"
        string image_url
        string description
        date created_at
        date updated_at
    }

    OTP {
        ObjectId _id PK
        string identifier
        string otp "Bcrypt Hashed"
        date expires_at "TTL auto-delete index"
    }

    REVIEW {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId movie_id FK
        number rating
        string comment
        date created_at
    }
```

---

## 📡 5. REST API Endpoints Reference

### 🔑 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/phone/send-otp` | Generates & sends secure 6-digit OTP via Email/SMS | Public |
| `POST` | `/api/auth/phone/verify-otp` | Validates bcrypt-hashed OTP & issues JWT token | Public |
| `POST` | `/api/auth/login` | Traditional email & password authentication | Public |
| `POST` | `/api/auth/register` | Traditional registration with credentials | Public |
| `GET` | `/api/auth/profile` | Fetches active authenticated user profile | Private |
| `PUT` | `/api/auth/profile` | Updates user details with name validation | Private |
| `DELETE`| `/api/auth/profile` | Deletes user account and associated session | Private |

---

### 🎥 Movie Endpoints (`/api/movies`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Fetches movies with search, filter, and sort queries | Public |
| `GET` | `/api/movies/:id` | Fetches movie details & increments view count atomically | Public |
| `GET` | `/api/movies/featured` | Fetches Hero Carousel featured movies | Public |
| `GET` | `/api/movies/genres` | Returns distinct genres in the current catalog | Public |
| `GET` | `/api/movies/:id/similar` | Fetches related movies based on genre matching | Public |
| `POST` | `/api/movies` | Creates new movie with auto IMDb popularity sync | Admin Only |
| `PUT` | `/api/movies/:id` | Updates movie details | Admin Only |
| `DELETE`| `/api/movies/:id` | Deletes movie from catalog | Admin Only |
| `PATCH` | `/api/movies/:id/feature` | Toggles Hero Banner featured status | Admin Only |
| `PATCH` | `/api/movies/:id/status` | Updates distribution status (active/hidden/etc.) | Admin Only |
| `POST` | `/api/movies/sync-popularity`| Synchronizes all movies with live IMDb ratings & views | Admin Only |

---

### 💬 Review Endpoints (`/api/reviews`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies/:id/reviews` | Fetches all community reviews for a movie | Public |
| `POST` | `/api/movies/:id/reviews` | Submits a new star rating and comment | Private |
| `DELETE`| `/api/reviews/:id` | Deletes a review | Admin / Author |

---

## 🔒 6. Security & Performance Highlights

1. **Defense-in-Depth OTP Security**:
   - OTP codes are hashed via `bcryptjs` with unique cryptographic salts.
   - Database documents auto-expire and delete automatically after 5 minutes using MongoDB TTL indexes.
   - Network API response payloads never expose plaintext verification passcodes.
2. **Atomic MongoDB Operations**:
   - View increments use `$inc: { views_count: 1 }` to prevent race conditions during high concurrent traffic.
3. **Optimized Frontend Rendering**:
   - Next.js Turbopack compiler.
   - Debounced search inputs to eliminate query thrashing.
   - Memoized filter computations for zero-lag client-side responsiveness.
