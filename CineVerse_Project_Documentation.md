# 🎬 CineVerse - Full-Stack Movie Catalog & Streaming Discovery Platform
## 📖 Comprehensive Technical Documentation & Architecture Report (2026 Edition)

---

## 📌 1. Project Overview & System Concept

### 🎯 1.1 Executive Summary
**CineVerse** is a full-stack, enterprise-grade **Movie Catalog & Streaming Discovery Platform** developed to provide movie enthusiasts with a unified, high-performance portal for movie discovery, official trailer playback, verified IMDb ratings, realistic live view metrics, community reviews, and personalized watchlists.

### 💡 1.2 Purpose & Problem Statement
* **Discovery Fragmentation**: Users often struggle to find consolidated movie metadata, accurate IMDb ratings, and official trailers in one fast, responsive interface.
* **Trailer Restrictions**: Direct embedded iframes often break due to domain blocking and copyright policies; CineVerse uses a verified official studio trailer routing mechanism.
* **Data Accuracy & View Tracking**: CineVerse implements atomic, unique view tracking that prevents view count inflation upon page reloads and back navigation.
* **Persistent Authentication**: Seamless passwordless authentication with Email/SMS OTP and Google OAuth, maintaining sessions across browser restarts until explicit logout.

---

## 🛠️ 2. Technology Stack & Hardware/Software Specifications

### 💻 2.1 Software Specifications & Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router, Turbopack) | `16.0.0+` | SSR/CSR hybrid rendering, routing, and fast hydration |
| **Frontend Language** | TypeScript | `5.0+` | Strict type safety, interfaces, and compile-time validation |
| **Styling & Design** | Tailwind CSS | `3.4+` | Glassmorphism, dark cinema aesthetics, responsive grid |
| **Icons & Assets** | Lucide React & FlagCDN | Latest | Modern iconography and dynamic country flag assets |
| **State Management** | React Context API | Built-in | Universal real-time state synchronization across tabs |
| **Backend Runtime** | Node.js | `20.x LTS` | Server-side JavaScript runtime environment |
| **Backend Framework** | Express.js | `4.19+` | RESTful API server, routing, and middleware pipeline |
| **Database** | MongoDB Atlas (NoSQL) | `7.0+` | Cloud document storage with replica sets |
| **ODM / Data Modeling** | Mongoose | `8.0+` | Schema validation, compound indexing, TTL indexes |
| **Security & Auth** | JSON Web Tokens (JWT) & BcryptJS | Latest | Stateless authentication & cryptographic salted hashing |
| **Email Delivery** | Nodemailer | `6.9+` | SMTP relay for high-deliverability 6-digit OTP delivery |
| **External APIs** | OMDb API / IMDb Engine | REST | Live real-world movie ratings and popularity sync |
| **Third-Party Auth** | Firebase Auth (Client SDK) | `11.0+` | 1-Click Google OAuth popup authentication |

### 🖥️ 2.2 System & Hardware Requirements

* **Development Environment**:
  - OS: Windows 10/11, macOS, Linux
  - Node.js: >= v18.0.0
  - RAM: Minimum 4 GB (Recommended 8 GB+)
  - Storage: 1 GB free space for node_modules and assets
* **Production Hosting**:
  - Frontend: Render / Vercel (Edge Network)
  - Backend: Render Web Service (Node.js LTS)
  - Database: MongoDB Atlas (M0 / Dedicated Cluster)

---

## 🏗️ 3. System Architecture & High-Level Design

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CineVerse 3-Tier Architecture                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                  HTTPS / WSS Requests
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION TIER (Next.js 16 + TypeScript + Tailwind CSS)                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • UI Components: Navbar, HeroBanner, FilterBar, MovieGrid, MovieCard, PhoneAuthHero   │
│ • State Stores (React Context):                                                        │
│   - MovieContext (Catalog, Filters, Real-Time In-Store View Sync)                      │
│   - AuthContext (Persistent LocalStorage Token & User State)                           │
│   - WatchlistContext (Optimistic UI Bookmarking)                                       │
│   - ToastContext (Non-blocking Global Feedback Alerts)                                 │
│ • Client Services: API Client (Axios), Official Trailer Engine (YouTube Resolver)      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                REST API Calls (JSON)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. APPLICATION / BUSINESS LOGIC TIER (Express.js + TypeScript)                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Middleware Pipeline: Helmet, CORS Whitelist, JWT Verification, Global Error Handler  │
│ • Controllers:                                                                         │
│   - AuthController: Multi-channel OTP, Bcrypt verification, Google OAuth, Profile CRUD │
│   - MovieController: Full-text search, multi-taxonomy filters, atomic view increments │
│   - ReviewController: 5-Star submissions, real-time average score recalculation        │
│ • Background Services: Dynamic OMDb/IMDb Popularity Sync Engine, Nodemailer SMTP Relay │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                  Mongoose ODM Queries
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. DATA PERSISTENCE TIER (MongoDB Atlas Cloud Cluster)                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Collections:                                                                         │
│   - `users`: User profiles, credentials, role (user/admin), watchlist ObjectIds       │
│   - `movies`: Titles, genres, release years, IMDb ratings, view counts, poster URLs   │
│   - `reviews`: Star ratings (1-5), comments, user & movie foreign keys                │
│   - `otps`: Salted Bcrypt OTP hashes, identifier index, 5-minute TTL auto-expiration   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 4. Feature Technical Data Flows

### 🌟 4.1 Featured Movies & Hero Banner Technical Flow
The Featured Movies Carousel represents the platform's flagship showcase, integrating an admin toggle workflow, indexed MongoDB querying, and auto-sliding ambient UI components.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 🛡️ Admin
    actor User as 👤 User
    participant UI as 🖥️ HeroBanner.tsx
    participant State as 🔄 MovieContext.tsx
    participant API as ⚡ Express API
    participant DB as 🗄️ MongoDB Atlas

    Note over Admin, DB: Phase A: Admin Marks Movie as Featured
    Admin->>API: PATCH /api/movies/:id/feature (Authorization: Bearer <Admin_JWT>)
    API->>DB: Movie.findById(id) -> movie.is_featured = !movie.is_featured -> save()
    DB-->>API: Document updated { is_featured: true }
    API-->>Admin: 200 OK + Updated movie data

    Note over User, DB: Phase B: User Loads Featured Carousel
    User->>UI: Navigates to Homepage (/)
    UI->>State: Request active catalog
    State->>API: GET /api/movies/featured
    API->>DB: Movie.find({ is_featured: true, status: 'active' }).sort({ rating: -1 })
    DB-->>API: Array of featured movie documents
    API-->>State: Sets featuredMovies state store
    State-->>UI: Passes featuredMovies prop to HeroBanner

    Note over UI: Phase C: Carousel Lifecycle & User Actions
    UI->>UI: Starts 7-second auto-slide timer (setInterval)
    UI->>UI: Renders ambient blur backdrop + badges + title + synopses
    User->>UI: Click "Watch Trailer" -> Launches verified official YouTube trailer
    User->>UI: Click "+ Add to List" -> Toggles WatchlistContext optimistic bookmark
    User->>UI: Click "View Details" -> Client-side route transition to /movies/:id
```

### 👁️ 4.2 Single Unique View Tracking Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Visitor
    participant View as 🖥️ /movies/[id]/page.tsx
    participant Store as 💾 Local/Session Storage
    participant API as ⚡ Express API
    participant DB as 🗄️ MongoDB Atlas
    participant Context as 🔄 MovieContext.tsx

    User->>View: Opens Movie Details Page (/movies/:id)
    View->>Store: Check if movie ID exists in cineverse_viewed_movie_ids
    alt Movie ID NOT found (First Visit)
        View->>Store: Store movie ID in visited list
        View->>API: GET /api/movies/:id?inc_view=true
        API->>DB: Movie.findOneAndUpdate({ _id: id }, { $inc: { views_count: 1 } }, { new: true })
        DB-->>API: Returns document with incremented view count (+1)
        API-->>View: Returns updated movie data
        View->>Context: updateMovieInStore(updatedMovie) [Real-time sync across all cards]
    else Movie ID Already Exists (Duplicate / Back Navigation)
        View->>API: GET /api/movies/:id?inc_view=false
        API->>DB: Movie.findOne({ _id: id }) [Read-only query]
        DB-->>API: Returns existing movie data
        API-->>View: Returns data (Zero view count increment)
    end
```

---

## 👥 5. User & Administrator Operating Guide & Workflows

### 👤 5.1 End-User Workflow (User Journey)
1. **Passwordless Onboarding**:
   - The user accesses the landing hero screen.
   - Enters mobile phone number with the dynamic country code selector (Default `🇮🇳 +91`) or email address, or clicks **"Sign in with Google"**.
   - Inputs the 6-digit verification OTP received via Email/SMS.
   - Session persists indefinitely in browser `localStorage` until the user explicitly signs out.
2. **Catalog Discovery & Search**:
   - **Hero Banner Showcase**: Views high-priority featured movies with auto-sliding animation.
   - **Instant Search**: Types movie titles into the 350ms debounced search bar.
   - **Multi-Taxonomy Filtering**: Narrows catalog by genre pills (Action, Sci-Fi, Crime, etc.), release year range (1950–present), and sorting criteria (Popularity, Top Rated, Latest).
3. **Movie Streaming & Details**:
   - Clicks any movie card to load the dedicated widescreen details page.
   - Unique view counter atomically increments **(+1)** on first visit.
   - Clicks **"Watch Trailer"** to launch official studio trailers directly on YouTube in an unblocked tab.
4. **Community Engagement & Watchlist**:
   - Submits interactive 1-to-5 star ratings and written reviews.
   - Clicks **"+ Add to List"** to bookmark titles into their personal Watchlist (`My List` tab).
   - Manages profile credentials and viewing history.

---

### 🛡️ 5.2 Platform Administrator Workflow (Admin Studio `/admin`)
1. **Secure Admin Authentication**:
   - Admin logs in with administrative credentials (`admin@cineverse.com`).
   - The system validates JWT payload role (`role === 'admin'`) and unlocks the protected `/admin` portal.
2. **Catalog Content Lifecycle Management (CRUD)**:
   - **Add Movie**: Fills in movie metadata (Title, Genre, Release Year, Description, Poster URL/Base64) and submits.
   - **Poster Compression**: Client-side canvas compressor converts uploaded images to optimized Base64 data strings.
   - **Edit & Update**: Edits movie synopses, genres, and ratings in real-time.
   - **Delete**: Soft or hard deletes outdated movie records from the catalog.
3. **Hero Carousel Curation**:
   - Toggles the ⭐ Star Featured button to instantly promote or demote movies to/from the homepage Hero Banner.
4. **Visibility & Distribution Control**:
   - Sets movie distribution status: `Active` (publicly visible), `Hidden` (unlisted), `Under Review` (pending moderation), or `Removed`.
5. **⚡ 1-Click Live IMDb Popularity Engine**:
   - Triggers the global sync routine calling OMDb/IMDb APIs to update real-world ratings and million-scale viewer statistics across the catalog.

---

## 📋 6. Functional Requirements (FR)

| Requirement ID | Module | Feature / Description | Actor |
| :--- | :--- | :--- | :--- |
| **FR-1.1** | Authentication | Passwordless OTP login/registration via Email (Nodemailer SMTP). | User / Guest |
| **FR-1.2** | Authentication | Passwordless OTP login/registration via Mobile Phone Number (SMS). | User / Guest |
| **FR-1.3** | Authentication | 1-Click Google OAuth popup authentication with automated token issuance. | User / Guest |
| **FR-1.4** | Authentication | Persistent session storage in `localStorage` until explicit user sign-out. | Authenticated User |
| **FR-1.5** | Authentication | Role-based access control (RBAC) protecting `/admin` routes. | Admin |
| **FR-1.6** | Authentication | Searchable Dynamic Country Code Selector (India `+91` default, US, UK, etc.). | User / Guest |
| **FR-2.1** | Movie Catalog | Full-width responsive movie catalog grid (2 to 7 responsive columns). | All |
| **FR-2.2** | Movie Catalog | 350ms debounced real-time instant search by movie title and keywords. | All |
| **FR-2.3** | Movie Catalog | Multi-taxonomy filtering by Genre pills and Release Year (1950–Present). | All |
| **FR-2.4** | Movie Catalog | Multi-criteria sorting (Popularity/Views, Top Rated, Latest, A-Z, Z-A). | All |
| **FR-2.5** | Movie Catalog | Auto-sliding featured Hero Carousel showcasing blockbuster highlights. | All |
| **FR-3.1** | Streaming & Details | Dedicated Movie Details page with metadata, synopsis, and rating badges. | All |
| **FR-3.2** | Streaming & Details | Official studio YouTube trailer launcher bypassing iframe embedding blocks. | All |
| **FR-3.3** | Streaming & Details | Single unique view tracking (+1 on first visit, 0 on back navigation/reload).| All |
| **FR-3.4** | Streaming & Details | Real-time global view count synchronization (`updateMovieInStore`) without F5. | All |
| **FR-4.1** | Reviews & Ratings | Interactive 5-star rating studio with comment submission. | Authenticated User |
| **FR-4.2** | Reviews & Ratings | Automatic recalculation of movie's average rating in MongoDB upon review. | System |
| **FR-4.3** | Reviews & Ratings | Review management (Users can delete own reviews; Admins can delete any). | User / Admin |
| **FR-5.1** | Watchlist & History | 1-Click Bookmark / Watchlist addition and removal with optimistic UI state. | Authenticated User |
| **FR-5.2** | Watchlist & History | Client-side Recently Viewed store tracking last 14 viewed titles. | Authenticated User |
| **FR-6.1** | Admin Studio | Full CRUD management for movies (Add, Edit, Delete, Image Upload/Compression).| Admin Only |
| **FR-6.2** | Admin Studio | Catalog distribution workflow (`Active`, `Hidden`, `Under Review`, `Removed`). | Admin Only |
| **FR-6.3** | Admin Studio | 1-Click live IMDb synchronization for catalog popularity and view metrics. | Admin Only |

---

## ⚡ 7. Non-Functional Requirements (NFR)

| Requirement No. | Description | Category | Standard Met |
| :--- | :--- | :--- | :--- |
| **NFR1** | The system must deliver page loads under 1.5s with a 350ms search debounce to prevent network congestion. | Performance | Sub-1.5s initial load, instant cached transitions |
| **NFR2** | The system must securely hash all OTPs with Bcrypt and enforce a 5-minute TTL auto-expiration index in database. | Security | Zero plain-text OTP storage, zero-leak API responses |
| **NFR3** | The system must provide a fluid, user-friendly interface scaling smoothly across screen sizes from 320px to 4K displays. | Usability | Responsive 2 to 7 column Tailwind CSS grid |
| **NFR4** | The system must maintain user authentication state across browser and tab restarts using persistent storage. | Reliability | Token persistence in `localStorage` with `sessionStorage` sync |
| **NFR5** | The system must accurately count unique movie visits and prevent artificial view count inflation during navigation. | Data Integrity | Atomic MongoDB `$inc` + client-side visited ID cache |
| **NFR6** | The system must be fully compatible with major modern browsers (Chrome, Edge, Firefox, Safari) with zero console errors. | Compatibility | Strict TypeScript 5 + Cross-browser CSS standards |

---

## 🗄️ 8. Database Schema & Data Dictionary

### 8.1 Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ REVIEW : "submits"
    USER ||--o{ MOVIE : "saves in watchlist"
    MOVIE ||--o{ REVIEW : "has"

    USER {
        ObjectId _id PK
        string name "User full name"
        string first_name "First name"
        string surname "Last name"
        string gender "Male | Female | Other"
        string email UK "Unique email address"
        string phone UK "Unique mobile number"
        string role "user | admin (Default: user)"
        ObjectId[] watchlist FK "Referenced Movie IDs"
        date created_at "Timestamp"
    }

    MOVIE {
        ObjectId _id PK
        string title "Movie Title (Indexed)"
        string genre "Comma-separated genres"
        number release_year "Year of release"
        number rating "IMDb average rating (0.0 - 10.0)"
        number views_count "Total verified unique views"
        boolean is_featured "Featured in Hero Carousel"
        string status "active | hidden | under_review | removed"
        string image_url "High-res poster URL / Base64"
        string description "Full movie synopsis"
        date created_at "Timestamp"
        date updated_at "Timestamp"
    }

    OTP {
        ObjectId _id PK
        string identifier UK "Email or Phone Number"
        string otp "Bcrypt Salted Hash"
        date expires_at "TTL auto-expiry (300 seconds)"
    }

    REVIEW {
        ObjectId _id PK
        ObjectId user_id FK "Reference to USER"
        ObjectId movie_id FK "Reference to MOVIE"
        number rating "Star rating (1 to 5)"
        string comment "User review text"
        date created_at "Timestamp"
    }
```

### 8.2 Data Dictionary (Collections & Field Definitions)

#### Table: `users`
| Field Name | Data Type | Nullable | Unique | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | No | Yes | Auto (PK) | Primary key identifier |
| `name` | String | No | No | - | Display name of the user |
| `first_name` | String | Yes | No | - | User first name |
| `surname` | String | Yes | No | - | User last name / surname |
| `gender` | String | Yes | No | - | Gender (`Male`, `Female`, `Other`) |
| `email` | String | Yes | Yes (Sparse) | - | Email address for login and OTP |
| `phone` | String | Yes | Yes (Sparse) | - | Mobile number with country code |
| `role` | String | No | No | `'user'` | Role-based authorization (`'user'`, `'admin'`) |
| `watchlist` | Array[ObjectId]| No | No | `[]` | Array of referenced Movie `_id` values |
| `created_at` | Date | No | No | `Date.now` | User registration timestamp |

#### Table: `movies`
| Field Name | Data Type | Nullable | Unique | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | No | Yes | Auto (PK) | Primary key identifier |
| `title` | String | No | No | - | Movie title (Text indexed for search) |
| `genre` | String | No | No | - | Primary genres (e.g. "Action, Sci-Fi") |
| `release_year`| Number | No | No | - | Release year (e.g. 2024) |
| `rating` | Number | No | No | `0` | Calculated average rating (0.0 to 10.0) |
| `views_count` | Number | No | No | `0` | Total verified unique view impressions |
| `is_featured` | Boolean | No | No | `false` | Homepage Hero Banner carousel flag |
| `status` | String | No | No | `'active'` | Lifecycle status (`active`, `hidden`, etc.) |
| `image_url` | String | No | No | - | Poster image URL or Base64 data string |
| `description` | String | No | No | - | Detailed synopsis / storyline |

#### Table: `otps`
| Field Name | Data Type | Nullable | Unique | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | No | Yes | Auto (PK) | Primary key identifier |
| `identifier` | String | No | Yes | - | Destination email or mobile number |
| `otp` | String | No | No | - | Cryptographically salted Bcrypt hash |
| `expires_at` | Date | No | No | `+5 mins` | TTL Index (`expireAfterSeconds: 0`) |

---

## 📡 9. REST API Specifications

| Method | Endpoint | Query / Body | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/phone/send-otp` | `{ identifier }` | Public | Sends 6-digit OTP via Email/SMS |
| `POST` | `/api/auth/phone/verify-otp`| `{ identifier, otp, name }` | Public | Validates OTP & returns JWT token |
| `POST` | `/api/auth/google` | `{ name, email, google_id }` | Public | Google OAuth token issuance |
| `GET` | `/api/movies` | `search`, `genre`, `release_year`, `sort` | Public | Returns filtered & sorted catalog |
| `GET` | `/api/movies/:id` | `inc_view=true/false` | Public | Details + atomic unique view tracking |
| `GET` | `/api/movies/featured` | None | Public | Returns Hero Carousel featured movies |
| `GET` | `/api/movies/genres` | None | Public | Distinct genres array |
| `GET` | `/api/movies/:id/reviews`| None | Public | Returns community reviews list |
| `POST` | `/api/movies/:id/reviews`| `{ rating, comment }` | Private | Submits 5-star review & recalculates average |
| `POST` | `/api/movies` | Movie data payload | Admin | Creates new movie with live IMDb sync |
| `PUT` | `/api/movies/:id` | Movie data payload | Admin | Updates existing movie metadata |
| `DELETE`| `/api/movies/:id` | None | Admin | Deletes movie from catalog |
| `PATCH` | `/api/movies/:id/feature`| None | Admin | Toggles Hero Banner featured status |
| `PATCH` | `/api/movies/:id/status` | `{ status }` | Admin | Updates distribution status |
| `POST` | `/api/movies/sync-popularity`| None | Admin | Live sync with OMDb/IMDb ratings & views |

---

## 🔒 10. Security & Optimization Engineering

1. **Zero Plaintext Credentials**: All verification OTP codes are hashed via `bcryptjs` with salt rounds before database insertion.
2. **Zero-Leak API Responses**: Backend responses never send raw OTP strings or password hashes, eliminating devtools inspection attack vectors.
3. **Database TTL Indexes**: Expired OTP records are automatically purged by MongoDB background workers using `expires_at` TTL indexes.
4. **Debounced Network Requests**: 350ms client-side debouncing on search queries prevents server request flooding.
5. **View Deduplication Engine**: Client-side localStorage ID cache ensures users cannot inflate movie view metrics by simply hitting browser back/refresh buttons.
6. **Stateless JWT Authorization**: Secure Bearer tokens with role claims (`user`/`admin`) enforce route guarding at the API middleware layer.

---

## 🚀 11. Deployment & Production Setup

### Environment Variables Configuration

#### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cineverse?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_2026
CLIENT_URL=https://movie-catalog-cineverse-frontend.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=cineverse.auth@gmail.com
SMTP_PASS=your_app_password
OMDB_API_KEY=your_omdb_key
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://movie-catalog-cineverse.onrender.com/api
```

---

## 🏁 12. Summary & Conclusion
CineVerse represents a modern, resilient, full-stack streaming discovery architecture combining **Next.js 16**, **Express.js**, and **MongoDB Atlas**. With strict TypeScript type safety, persistent passwordless authentication, responsive dark cinema aesthetics, and real-time state synchronization, CineVerse provides an industry-standard solution for movie catalog management and user discovery.
